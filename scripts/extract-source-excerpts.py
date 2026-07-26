#!/usr/bin/env python3
"""Extract official Scope sections from 3GPP DOCX archives into local D1.

This stores only a short source excerpt, not the complete specification.

Usage:
  python scripts/extract-source-excerpts.py --key-only --limit=50 \
    --sql-out=scripts/source-excerpts.sql
  python scripts/extract-source-excerpts.py --release=Rel-20
"""

from __future__ import annotations

import argparse
import html
import io
import re
import sqlite3
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
STATE_DIR = ROOT / ".wrangler" / "state" / "v3" / "d1" / "miniflare-D1DatabaseObject"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
USER_AGENT = "3gpp-sniffer-source-extractor/1.0"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db")
    parser.add_argument("--release")
    parser.add_argument("--specs", help="Comma-separated spec IDs")
    parser.add_argument("--key-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--sql-out")
    return parser.parse_args()


def find_db(explicit: str | None) -> Path:
    if explicit:
        return Path(explicit)
    candidates = list(STATE_DIR.glob("*.sqlite"))
    valid: list[Path] = []
    for candidate in candidates:
        try:
            db = sqlite3.connect(candidate)
            if db.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name='specs'"
            ).fetchone():
                valid.append(candidate)
            db.close()
        except sqlite3.Error:
            pass
    if len(valid) != 1:
        raise RuntimeError(f"Expected one local D1 database, found {len(valid)}")
    return valid[0]


def release_number(value: str) -> int:
    if value in ("R99", "Rel-99"):
        return 99
    match = re.fullmatch(r"Rel-(\d+)", value or "", re.I)
    return int(match.group(1)) if match else 0


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def paragraphs_from_docx(data: bytes) -> list[tuple[str, str]]:
    with zipfile.ZipFile(io.BytesIO(data)) as docx:
        xml = docx.read("word/document.xml")
    root = ElementTree.fromstring(xml)
    paragraphs: list[tuple[str, str]] = []
    for paragraph in root.findall(".//w:p", NS):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        if not text:
            continue
        style_node = paragraph.find("./w:pPr/w:pStyle", NS)
        style = ""
        if style_node is not None:
            style = style_node.attrib.get(f"{{{NS['w']}}}val", "")
        paragraphs.append((html.unescape(text), style))
    return paragraphs


def extract_scope(paragraphs: list[tuple[str, str]], max_chars: int = 6000) -> str | None:
    start = None
    for index, (text, _style) in enumerate(paragraphs):
        normalized = re.sub(r"\s+", " ", text).strip()
        if re.fullmatch(r"(?:1(?:\.0)?\s*)?Scope", normalized, re.I):
            start = index + 1
            break
    if start is None:
        return None

    selected: list[str] = []
    total = 0
    for text, style in paragraphs[start:]:
        normalized = re.sub(r"\s+", " ", text).strip()
        if selected and (
            re.match(r"^(?:Heading|Titre)[ _-]?[12]$", style, re.I)
            or re.match(r"^2(?:\.0)?\s+\S", normalized)
            or re.fullmatch(r"(?:2(?:\.0)?\s*)?References", normalized, re.I)
        ):
            break
        if total + len(normalized) + 1 > max_chars:
            break
        selected.append(normalized)
        total += len(normalized) + 1
    excerpt = "\n\n".join(selected).strip()
    return excerpt if len(excerpt) >= 80 else None


def excerpt_from_archive(url: str) -> str | None:
    archive_data = fetch_bytes(url)
    with zipfile.ZipFile(io.BytesIO(archive_data)) as archive:
        names = archive.namelist()
        docx_name = next((name for name in names if name.lower().endswith(".docx")), None)
        if not docx_name:
            return None
        docx_data = archive.read(docx_name)
    return extract_scope(paragraphs_from_docx(docx_data))


def sql_escape(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> int:
    args = parse_args()
    db = sqlite3.connect(find_db(args.db))
    db.row_factory = sqlite3.Row

    columns = {row[1] for row in db.execute("PRAGMA table_info(specs)")}
    if "source_excerpt" not in columns:
        raise RuntimeError("Apply migrations/0002_source_excerpts.sql locally first")

    rows = list(
        db.execute(
            """SELECT id, spec_id, release, ftp_url, is_key_spec, source_excerpt
               FROM specs
               WHERE ftp_url IS NOT NULL AND ftp_url LIKE '%.zip'
               ORDER BY spec_id"""
        )
    )
    if not args.force:
        rows = [row for row in rows if not row["source_excerpt"]]

    if args.release:
        rows = [row for row in rows if row["release"] == args.release]
    if args.specs:
        requested = {value.strip() for value in args.specs.split(",") if value.strip()}
        rows = [row for row in rows if row["spec_id"] in requested]
    if args.key_only:
        key_ids = {
            row[0]
            for row in db.execute("SELECT DISTINCT spec_id FROM specs WHERE is_key_spec = 1")
        }
        rows = [row for row in rows if row["spec_id"] in key_ids]

    # Extract one newest available release per spec. Scope generally changes less
    # than full normative text, and this avoids downloading every release copy.
    newest: dict[str, sqlite3.Row] = {}
    for row in rows:
        current = newest.get(row["spec_id"])
        if current is None or release_number(row["release"]) > release_number(current["release"]):
            newest[row["spec_id"]] = row
    rows = sorted(newest.values(), key=lambda row: row["spec_id"])
    if args.limit:
        rows = rows[: args.limit]

    timestamp = datetime.now(timezone.utc).isoformat()
    sql_lines: list[str] = []
    success = skipped = failed = 0
    for index, row in enumerate(rows, 1):
        label = f"{row['spec_id']} {row['release']}"
        try:
            excerpt = excerpt_from_archive(row["ftp_url"])
            if not excerpt:
                print(f"[{index}/{len(rows)}] SKIP {label}: DOCX Scope not found")
                skipped += 1
                continue
            db.execute(
                """UPDATE specs
                   SET source_excerpt = ?, source_extracted_at = ?,
                       ai_summary = NULL, ai_summary_generated_at = NULL,
                       ai_relevance_score = NULL
                   WHERE spec_id = ? AND release = ?""",
                (excerpt, timestamp, row["spec_id"], row["release"]),
            )
            sql_lines.append(
                "UPDATE specs SET "
                f"source_excerpt = {sql_escape(excerpt)}, "
                f"source_extracted_at = {sql_escape(timestamp)}, "
                "ai_summary = NULL, ai_summary_generated_at = NULL, ai_relevance_score = NULL "
                f"WHERE spec_id = {sql_escape(row['spec_id'])} "
                f"AND release = {sql_escape(row['release'])};"
            )
            success += 1
            print(f"[{index}/{len(rows)}] OK   {label}: {len(excerpt)} chars")
            db.commit()
        except Exception as error:  # Continue; one malformed upstream file should not stop the run.
            failed += 1
            print(f"[{index}/{len(rows)}] FAIL {label}: {error}")

    if args.sql_out:
        # Export every locally extracted excerpt, not just this invocation. This
        # makes reruns/checkpointing safe and keeps remote D1 reproducible.
        sql_lines = []
        for source_row in db.execute(
            """SELECT spec_id, release, source_excerpt, source_extracted_at
               FROM specs WHERE source_excerpt IS NOT NULL"""
        ):
            sql_lines.append(
                "UPDATE specs SET "
                f"source_excerpt = {sql_escape(source_row['source_excerpt'])}, "
                f"source_extracted_at = {sql_escape(source_row['source_extracted_at'])}, "
                "ai_summary = NULL, ai_summary_generated_at = NULL, ai_relevance_score = NULL "
                f"WHERE spec_id = {sql_escape(source_row['spec_id'])} "
                f"AND release = {sql_escape(source_row['release'])};"
            )
        output = Path(args.sql_out)
        if not output.is_absolute():
            output = ROOT / output
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("\n".join(sql_lines) + ("\n" if sql_lines else ""), encoding="utf-8")
        print(f"Wrote {len(sql_lines)} statements to {output}")

    db.close()
    print(f"Complete: {success} extracted, {skipped} skipped, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

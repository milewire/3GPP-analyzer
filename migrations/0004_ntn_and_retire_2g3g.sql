-- Add NTN as a first-class technology and retire discontinued 2G/3G catalog areas.

INSERT OR IGNORE INTO technologies
  (name, slug, full_name, description, intro_release, generation, key_specs, icon, spec_count)
VALUES
  (
    'NTN',
    'ntn',
    'Non-Terrestrial Networks',
    'Satellite and other non-terrestrial access for NR and IoT, covering transparent and regenerative payloads, feeder links, and NTN-capable UE/RAN procedures.',
    'Rel-17',
    '5G',
    'TS 38.300,TS 38.821,TS 23.501',
    '🛰️',
    0
  );

-- Remove discontinued technology catalog entries.
DELETE FROM technologies
WHERE slug IN ('umts', 'gprs', 'gsm-edge')
   OR name IN ('UMTS', 'GPRS', 'GSM/EDGE');

-- Drop specs that belong to discontinued radio generations / GERAN series.
DELETE FROM specs
WHERE technology IN ('UMTS', 'GPRS', 'GSM/EDGE')
   OR series IN ('25', '41', '43', '44', '45', '49');

-- Retag NTN-focused titles that currently sit under NR / LTE technology buckets.
UPDATE specs
SET technology = 'NTN'
WHERE title LIKE '%NTN%'
   OR title LIKE '%Non-Terrestrial%'
   OR title LIKE '%Non Terrestrial%'
   OR title LIKE '%satellite access%'
   OR title LIKE '%Satellite Access%';

UPDATE technologies
SET generation = '4G/5G'
WHERE slug = 'ims' AND generation = '3G/4G/5G';

UPDATE releases
SET spec_count = (SELECT COUNT(*) FROM specs WHERE specs.release = releases.name);

UPDATE technologies
SET spec_count = (SELECT COUNT(DISTINCT spec_id) FROM specs WHERE specs.technology = technologies.name);

import type { Metadata } from "next";
import "./globals.css";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "RAN Reference — 3GPP Specification Database",
  description:
    "Browse, search, and understand 3GPP technical specifications with AI-powered summaries, version tracking, and technology guides for RAN engineers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-offwhite text-darktext antialiased">
        <NavHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchHub AI - Intelligent Research Workspace",
  description:
    "Upload research PDFs, search extracted text, and ask questions with source excerpts checked against the document.",
  keywords: [
    "ResearchHub AI",
    "AI Research",
    "PDF Q&A",
    "Document Intelligence",
    "Document Research",
    "Citation Extraction",
  ],
  authors: [{ name: "ResearchHub AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

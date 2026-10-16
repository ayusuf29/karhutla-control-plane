import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nusantara Fire Sentinel - Mission Command & Karhutla Prevention",
  description: "Prescriptive-preventive spatial early warning & Manggala Agni patrol optimization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased bg-obsidian text-slate-100 font-sans h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}

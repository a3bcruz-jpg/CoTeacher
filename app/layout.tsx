import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoTeacher | Teacher Admin Copilot",
  description:
    "AI-powered administrative copilot designed to help Philippine teachers reduce repetitive work.",
};

export const viewport: Viewport = {
  themeColor: "#10243d",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

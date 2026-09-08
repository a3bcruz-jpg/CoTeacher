import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoTeacher | Teacher Admin Copilot",
  description:
    "AI-powered administrative copilot designed to help Philippine teachers reduce repetitive work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

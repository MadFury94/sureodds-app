import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sureodds | Sports. Odds. News. Now.",
  description: "Stay ahead with Sureodds. Expert analysis, highlights, scores, and betting odds for all your favorite sports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

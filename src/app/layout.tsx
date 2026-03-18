import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sureodds | Sports. Odds. News. Now.",
  description: "Stay ahead with Sureodds. Expert analysis, highlights, scores, and betting odds for all your favorite sports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", backgroundColor: "#f2f5f6" }}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

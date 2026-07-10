import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Page Not Found | Sureodds",
    description: "The page you are looking for doesn't exist or has been moved.",
    robots: { index: false, follow: false },
};

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const POPULAR_LINKS = [
    { href: "/", label: "Home" },
    { href: "/betting", label: "Betting Tips" },
    { href: "/bet-codes", label: "Bet Codes" },
    { href: "/category/news", label: "Football News" },
    { href: "/category/epl", label: "Premier League" },
    { href: "/category/ucl", label: "Champions League" },
];

export default function NotFound() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1.2rem" }}>
            <style>{`
                .nf-link {
                    padding: 1.4rem;
                    border: 1.5px solid #e8ebed;
                    border-radius: 0.8rem;
                    font-family: ${f};
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    text-decoration: none;
                    background-color: #fff;
                    display: block;
                    text-align: center;
                    transition: border-color 0.15s, background-color 0.15s;
                }
                .nf-link:hover {
                    border-color: #ff6b00;
                    background-color: #fff5f0;
                }
                .nf-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.2rem;
                    margin-bottom: 4rem;
                }
                @media (max-width: 600px) {
                    .nf-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>

            <div style={{ maxWidth: "64rem", width: "100%", textAlign: "center" }}>

                <p style={{ fontFamily: fd, fontSize: "12rem", fontWeight: 700, color: "#f2f5f6", lineHeight: 1, margin: "0 0 -2rem", userSelect: "none" }}>
                    404
                </p>

                <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 1.6rem" }}>
                    Page Not Found
                </h1>

                <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#68676d", lineHeight: 1.65, margin: "0 auto 4rem", maxWidth: "48rem" }}>
                    This page doesn&apos;t exist or has been moved. Try one of these instead:
                </p>

                <div className="nf-grid">
                    {POPULAR_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="nf-link">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <Link
                    href="/"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", padding: "1.4rem 3.2rem", backgroundColor: "#1a1a1a", borderRadius: "0.8rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}

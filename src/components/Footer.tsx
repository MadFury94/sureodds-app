"use client";
import { useState } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const SOCIAL = {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "https://facebook.com/sureoddsng",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER ?? "https://twitter.com/sureoddsng",
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "https://instagram.com/sureoddsng",
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK ?? "https://tiktok.com/@sureoddsng",
};

const footerLinks1 = [
    { label: "About", href: "/about" },
    { label: "Advertise", href: "/advertise" },
    { label: "Contact Us", href: "/contact" },
    { label: "Get Help", href: "/help" },
    { label: "Careers", href: "/careers" },
    { label: "Sitemap", href: "/sitemap.xml" },
    { label: "Community Guidelines", href: "/community-guidelines" },
    { label: "Privacy", href: "/privacy-policy" },
];
const footerLinks2 = [
    { label: "Do Not Sell or Share My Personal Information", href: "/privacy-policy#do-not-sell" },
    { label: "Terms Of Use", href: "/terms-of-use" },
    { label: "AdChoices", href: "/privacy-policy#adchoices" },
    { label: "Creators Program", href: "/creators" },
];
const footerLinks3 = [
    { label: "Latest Articles", href: "/category/news" },
    { label: "RSS", href: "/feed.xml" },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleNewsletter(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage("You're in! Check your inbox for a welcome email.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Please try again.");
            }
        } catch {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    }

    return (
        <footer style={{ backgroundColor: "#000", color: "#fff" }}>
            <div className="footer-inner">

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <a href="/">
                        <img src="/logo.png" alt="Sureodds" style={{ height: "5rem", width: "auto", display: "block" }} />
                    </a>
                </div>

                {/* Newsletter */}
                <div className="footer-newsletter">
                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.2rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", textAlign: "center" }}>
                        Football News In Your Inbox
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textAlign: "center", lineHeight: 1.6 }}>
                        By subscribing, you agree to our{" "}
                        <a href="/terms-of-use" style={{ color: "#BD4110" }}>Terms of Use</a> and{" "}
                        <a href="/privacy-policy" style={{ color: "#BD4110" }}>Privacy Policy</a>.
                    </p>

                    {status === "success" ? (
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#22c55e", textAlign: "center", padding: "1.2rem", backgroundColor: "rgba(34,197,94,0.1)", borderRadius: "0.6rem" }}>
                            ✓ {message}
                        </p>
                    ) : (
                        <form onSubmit={handleNewsletter} className="footer-email-row">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={status === "loading"}
                                style={{
                                    flex: 1, padding: "1.2rem 1.6rem",
                                    backgroundColor: "#27262a", border: "none", borderRadius: "0.4rem",
                                    fontFamily: f, fontSize: "1.4rem", color: "#fff", outline: "none",
                                    opacity: status === "loading" ? 0.6 : 1,
                                }}
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                style={{
                                    padding: "1.2rem 2.4rem", backgroundColor: "#BD4110", border: "none",
                                    borderRadius: "0.4rem", fontFamily: f, fontSize: "1.4rem",
                                    fontWeight: 700, color: "#fff", cursor: status === "loading" ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1,
                                }}
                            >
                                {status === "loading" ? "..." : "Join"}
                            </button>
                        </form>
                    )}

                    {status === "error" && (
                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", textAlign: "center", marginTop: "0.8rem" }}>
                            {message}
                        </p>
                    )}
                </div>

                {/* Social icons */}
                <div style={{ display: "flex", gap: "2.4rem", alignItems: "center" }}>
                    <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                    </a>
                    <a href={SOCIAL.twitter} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.26 5.632 4.746-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>
                    <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                        </svg>
                    </a>
                </div>

                {/* Nav row 1 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", borderTop: "1px solid #27262a", paddingTop: "2.4rem", width: "100%" }}>
                    {footerLinks1.map((l, i) => (
                        <span key={l.label} style={{ display: "flex", alignItems: "center" }}>
                            <a href={l.href} style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem", textDecoration: "none" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l.label}</a>
                            {i < footerLinks1.length - 1 && <span style={{ color: "#27262a", fontSize: "1.4rem" }}>|</span>}
                        </span>
                    ))}
                </div>

                {/* Nav row 2 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {footerLinks2.map((l, i) => (
                        <span key={l.label} style={{ display: "flex", alignItems: "center" }}>
                            <a href={l.href} style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem", textDecoration: "none" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l.label}</a>
                            {i < footerLinks2.length - 1 && <span style={{ color: "#27262a", fontSize: "1.4rem" }}>|</span>}
                        </span>
                    ))}
                </div>

                {/* Nav row 3 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {footerLinks3.map((l, i) => (
                        <span key={l.label} style={{ display: "flex", alignItems: "center" }}>
                            <a href={l.href} style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem", textDecoration: "none" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l.label}</a>
                            {i < footerLinks3.length - 1 && <span style={{ color: "#27262a", fontSize: "1.4rem" }}>|</span>}
                        </span>
                    ))}
                </div>

                {/* Copyright */}
                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textAlign: "center" }}>
                    Copyright © {new Date().getFullYear()} Sureodds. A Sports Media Company. All Rights Reserved.
                </p>

            </div>
        </footer>
    );
}

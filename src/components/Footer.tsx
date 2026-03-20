"use client";
import { useState } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const footerLinks1 = ["About", "Advertise", "Contact Us", "Get Help", "Careers", "Sitemap", "Community Guidelines", "Privacy"];
const footerLinks2 = ["Do Not Sell or Share My Personal Information", "Terms Of Use", "AdChoices", "S/O Sports on HBO Max", "S/O Creators Program"];
const footerLinks3 = ["Latest Articles", "RSS"];

export default function Footer() {
    const [email, setEmail] = useState("");

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
                        📬 Sports News In Your Inbox
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textAlign: "center", lineHeight: 1.6 }}>
                        By entering your email address, you agree to the Sureodds{" "}
                        <a href="#" style={{ color: "#a855f7" }}>Terms of Use</a> and{" "}
                        <a href="#" style={{ color: "#a855f7" }}>Privacy Policy</a>.
                    </p>
                    <div className="footer-email-row">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                flex: 1, padding: "1.2rem 1.6rem",
                                backgroundColor: "#27262a", border: "none", borderRadius: "0.4rem",
                                fontFamily: f, fontSize: "1.4rem", color: "#fff", outline: "none",
                            }}
                        />
                        <button style={{
                            padding: "1.2rem 2.4rem", backgroundColor: "#a855f7", border: "none",
                            borderRadius: "0.4rem", fontFamily: f, fontSize: "1.4rem",
                            fontWeight: 700, color: "#fff", cursor: "pointer", whiteSpace: "nowrap",
                        }}>
                            Join
                        </button>
                    </div>
                </div>

                {/* Social icons */}
                <div style={{ display: "flex", gap: "2.4rem", alignItems: "center" }}>
                    {/* Facebook */}
                    <a href="#" aria-label="Facebook" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                    </a>
                    {/* X / Twitter */}
                    <a href="#" aria-label="X" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.26 5.632 4.746-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    {/* Instagram */}
                    <a href="#" aria-label="Instagram" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>
                    {/* TikTok */}
                    <a href="#" aria-label="TikTok" style={{ color: "#fff" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                        </svg>
                    </a>
                </div>

                {/* Nav links row 1 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0", borderTop: "1px solid #27262a", paddingTop: "2.4rem", width: "100%" }}>
                    {footerLinks1.map((l, i) => (
                        <span key={l} style={{ display: "flex", alignItems: "center" }}>
                            <a href="#" style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l}</a>
                            {i < footerLinks1.length - 1 && <span style={{ color: "#27262a", fontSize: "1.4rem" }}>|</span>}
                        </span>
                    ))}
                </div>

                {/* Nav links row 2 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0" }}>
                    {footerLinks2.map((l, i) => (
                        <span key={l} style={{ display: "flex", alignItems: "center" }}>
                            <a href="#" style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l}</a>
                            {i < footerLinks2.length - 1 && <span style={{ color: "#27262a", fontSize: "1.4rem" }}>|</span>}
                        </span>
                    ))}
                </div>

                {/* Nav links row 3 */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0" }}>
                    {footerLinks3.map((l, i) => (
                        <span key={l} style={{ display: "flex", alignItems: "center" }}>
                            <a href="#" style={{ fontFamily: f, fontSize: "1.2rem", color: "#fff", padding: "0 1.2rem" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >{l}</a>
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

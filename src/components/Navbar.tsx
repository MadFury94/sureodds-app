"use client";
import { useState } from "react";

const navItems = [
    { label: "NFL", hasDropdown: true },
    { label: "NBA", hasDropdown: true },
    { label: "MLB", hasDropdown: true },
    { label: "NHL", hasDropdown: true },
    { label: "Soccer", hasDropdown: true },
    { label: "MMA", hasDropdown: false },
    { label: "Boxing", hasDropdown: false },
    { label: "Odds", hasDropdown: false },
];

const megaMenuSports = [
    { icon: "🏈", label: "NFL" }, { icon: "🏀", label: "NBA" },
    { icon: "⚾", label: "MLB" }, { icon: "🏒", label: "NHL" },
    { icon: "⚽", label: "Soccer" }, { icon: "🏈", label: "College Football" },
    { icon: "🏀", label: "College Basketball" }, { icon: "🥊", label: "Boxing" },
    { icon: "🥋", label: "MMA" }, { icon: "🎾", label: "Tennis" },
    { icon: "⛳", label: "Golf" }, { icon: "🏎️", label: "NASCAR" },
    { icon: "🏋️", label: "WWE" }, { icon: "🏅", label: "Olympics" },
    { icon: "🏁", label: "F1" },
];

const rightLinks = ["Betting", "Sports on HBO Max"];

export default function Navbar() {
    const [activeRight, setActiveRight] = useState("Betting");
    const [megaOpen, setMegaOpen] = useState(false);

    return (
        <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#000" }}>
            {/* Full-width border line, content constrained inside */}
            <div style={{ borderBottom: "1px solid #27262a" }}>
                <div style={{
                    maxWidth: "128rem", margin: "0 auto",
                    display: "flex", alignItems: "center",
                    height: "7.2rem", padding: "0 2rem",
                }}>
                    {/* Hamburger */}
                    <button
                        onClick={() => setMegaOpen(!megaOpen)}
                        aria-label="Menu"
                        style={{ color: "#fff", marginRight: "1.2rem", flexShrink: 0, padding: "0.4rem", lineHeight: 0 }}
                    >
                        {megaOpen
                            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        }
                    </button>

                    {/* Logo box */}
                    <a href="/" style={{ flexShrink: 0, marginRight: "1.6rem" }}>
                        <div style={{
                            width: "4rem", height: "4rem", backgroundColor: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "0.2rem",
                        }}>
                            <span style={{
                                fontFamily: '"Druk Text Wide", "Arial Black", sans-serif',
                                fontWeight: 700, fontSize: "1.1rem",
                                color: "#000", lineHeight: 1, letterSpacing: "-0.02em",
                            }}>SO</span>
                        </div>
                    </a>

                    {/* Nav items */}
                    <nav style={{ display: "flex", alignItems: "center", flex: 1, gap: "0.2rem" }}>
                        {navItems.map((item) => (
                            <a key={item.label} href="#"
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.3rem",
                                    padding: "0.8rem 1.2rem", height: "7.2rem",
                                    fontFamily: '"Proxima Nova", Arial, sans-serif',
                                    fontWeight: 700, fontSize: "1.6rem",
                                    color: "#fff", whiteSpace: "nowrap",
                                    borderBottom: "2px solid transparent",
                                    transition: "border-color 0.15s",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#e9173d")}
                                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
                            >
                                {item.label}
                                {item.hasDropdown && (
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" style={{ opacity: 0.6 }}>
                                        <path d="M0 0l5 6 5-6z" />
                                    </svg>
                                )}
                            </a>
                        ))}
                    </nav>

                    {/* Right links */}
                    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        {rightLinks.map((link) => (
                            <button key={link} onClick={() => setActiveRight(link)}
                                style={{
                                    padding: "0.8rem 1.2rem", height: "7.2rem",
                                    fontFamily: '"Proxima Nova", Arial, sans-serif',
                                    fontWeight: 700, fontSize: "1.6rem",
                                    color: "#fff", whiteSpace: "nowrap",
                                    borderBottom: activeRight === link ? "2px solid #e9173d" : "2px solid transparent",
                                    transition: "border-color 0.15s",
                                }}
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mega menu — full width background, content constrained */}
            {megaOpen && (
                <div style={{ backgroundColor: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    <div style={{
                        maxWidth: "128rem", margin: "0 auto", padding: "2.4rem 1.6rem",
                        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem 0",
                    }}>
                        {megaMenuSports.map((sport) => (
                            <a key={sport.label} href="#" style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                padding: "1rem 0.8rem",
                                fontFamily: '"Proxima Nova", Arial, sans-serif',
                                fontWeight: 600, fontSize: "1.4rem",
                                color: "#1a1a1a",
                                borderBottom: "1px solid #eee",
                            }}>
                                <span style={{ fontSize: "1.8rem" }}>{sport.icon}</span>
                                {sport.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}

"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const navItems = [
    { label: "News", slug: "news" },
    { label: "Transfer", slug: "transfer" },
    { label: "Breaking News", slug: "breaking-news" },
    { label: "Football Stories", slug: "football-stories" },
    { label: "La Liga", slug: "la-liga" },
    { label: "EPL", slug: "epl" },
    { label: "UCL", slug: "ucl" },
    { label: "AFCON", slug: "afcon" },
];

const megaMenuSports = [
    { icon: "📰", label: "News", slug: "news" },
    { icon: "🔄", label: "Transfer", slug: "transfer" },
    { icon: "🚨", label: "Breaking News", slug: "breaking-news" },
    { icon: "⚽", label: "Football Stories", slug: "football-stories" },
    { icon: "🇪🇸", label: "La Liga", slug: "la-liga" },
    { icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "EPL", slug: "epl" },
    { icon: "🏆", label: "UCL", slug: "ucl" },
    { icon: "🌍", label: "AFCON", slug: "afcon" },
    { icon: "🌐", label: "International Football", slug: "international-football" },
    { icon: "📝", label: "Blog", slug: "blog" },
];

const rightLinks = [
    { label: "Betting", href: "/betting" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [megaOpen, setMegaOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#000" }}>
            <div style={{ borderBottom: "1px solid #27262a" }}>
                <div className="nav-inner">
                    {/* Hamburger */}
                    <button
                        onClick={() => setMegaOpen(!megaOpen)}
                        aria-label="Menu"
                        style={{ color: "#fff", marginRight: "1.2rem", flexShrink: 0, padding: "0.4rem", lineHeight: 0 }}
                    >
                        {megaOpen
                            ? <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            : <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        }
                    </button>

                    {/* Logo */}
                    <a href="/" style={{ flexShrink: 0, marginRight: "1.6rem" }}>
                        <div style={{
                            width: "4rem", height: "4rem", backgroundColor: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "0.2rem",
                        }}>
                            <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.1rem", color: "#000", lineHeight: 1, letterSpacing: "-0.02em" }}>SO</span>
                        </div>
                    </a>

                    {/* Desktop nav links */}
                    <nav className="nav-links">
                        {navItems.map((item) => {
                            const href = `/category/${item.slug}`;
                            const active = isActive(href);
                            return (
                                <a key={item.label} href={href} style={{
                                    display: "flex", alignItems: "center",
                                    padding: "0.8rem 1.2rem", height: "7.2rem",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.6rem",
                                    color: "#fff", whiteSpace: "nowrap",
                                    borderBottom: active ? "2px solid #e9173d" : "2px solid transparent",
                                    transition: "border-color 0.15s",
                                }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderBottomColor = "#e9173d"; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderBottomColor = "transparent"; }}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right links */}
                    <div className="nav-right">
                        {rightLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <a key={link.label} href={link.href} style={{
                                    display: "flex", alignItems: "center",
                                    padding: "0.8rem 1.2rem", height: "7.2rem",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.6rem",
                                    color: "#fff", whiteSpace: "nowrap",
                                    borderBottom: active ? "2px solid #e9173d" : "2px solid transparent",
                                    transition: "border-color 0.15s",
                                }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderBottomColor = "#e9173d"; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderBottomColor = "transparent"; }}
                                >
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mega menu / mobile drawer */}
            {megaOpen && (
                <div style={{ backgroundColor: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    {/* Mobile-only nav links (shown at ≤1024px via CSS) */}
                    <div className="mobile-nav-links">
                        {[
                            ...navItems.map(i => ({ label: i.label, href: `/category/${i.slug}` })),
                            ...rightLinks,
                        ].map(item => (
                            <a key={item.label} href={item.href} style={{
                                display: "block", padding: "1.2rem 2rem",
                                fontFamily: f, fontWeight: 700, fontSize: "1.6rem",
                                color: "#1a1a1a", borderBottom: "1px solid #eee",
                            }}>{item.label}</a>
                        ))}
                    </div>
                    {/* Desktop mega grid */}
                    <div style={{
                        maxWidth: "132.48rem", margin: "0 auto", padding: "2.4rem 2rem",
                    }} className="mega-grid desktop-mega">
                        {megaMenuSports.map((sport) => (
                            <a key={sport.label} href={`/category/${sport.slug}`} style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                padding: "1rem 0.8rem",
                                fontFamily: f, fontWeight: 600, fontSize: "1.4rem",
                                color: "#1a1a1a", borderBottom: "1px solid #eee",
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

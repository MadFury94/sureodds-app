"use client";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { fonts, LEAGUE_LOGOS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/config";

const f = fonts.body;

const navItems = [
    { label: "News", slug: "news" },
    { label: "Transfer", slug: "transfer" },
    { label: "Breaking News", slug: "breaking-news" },
    { label: "Football Stories", slug: "football-stories" },
    { label: "La Liga", slug: "la-liga" },
    { label: "Premier League", slug: "epl" },
    { label: "Champions League", slug: "ucl" },
    { label: "Africa Cup of Nations", slug: "afcon" },
    { label: "Serie A", slug: "serie-a" },
    { label: "International Football", slug: "international-football" },
];

const megaMenuSports = [
    { label: "Football News", slug: "news" },
    { label: "Transfer News", slug: "transfer" },
    { label: "Breaking News", slug: "breaking-news" },
    { label: "Football Stories", slug: "football-stories" },
    { label: "La Liga", slug: "la-liga" },
    { label: "Premier League", slug: "epl" },
    { label: "Champions League", slug: "ucl" },
    { label: "Africa Cup of Nations", slug: "afcon" },
    { label: "Serie A", slug: "serie-a" },
    { label: "International Football", slug: "international-football" },
];

function MegaIcon({ slug, label }: { slug: string; label: string }) {
    const logo = LEAGUE_LOGOS[slug];
    const accentColor = CATEGORY_COLORS[slug] ?? "#68676d";
    const isLocal = logo?.startsWith("/");
    if (logo) {
        return (
            <div style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.4rem", backgroundColor: isLocal ? accentColor : "transparent", padding: isLocal ? "0.3rem" : "0" }}>
                <img src={logo} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
        );
    }
    return (
        <div style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.4rem", backgroundColor: accentColor }}>
            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{label.slice(0, 2).toUpperCase()}</span>
        </div>
    );
}

type DrawerState = "closed" | "opening" | "open" | "closing";

export default function Navbar() {
    const [drawerState, setDrawerState] = useState<DrawerState>("closed");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();

    const isOpen = drawerState === "open" || drawerState === "opening";
    const isVisible = drawerState === "open" || drawerState === "opening";
    const isMounted = drawerState !== "closed";

    function openDrawer() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setDrawerState("opening");
        requestAnimationFrame(() => requestAnimationFrame(() => setDrawerState("open")));
        document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
        setDrawerState("closing");
        document.body.style.overflow = "";
        closeTimer.current = setTimeout(() => setDrawerState("closed"), 280);
    }

    function toggleDrawer() { if (isOpen) closeDrawer(); else openDrawer(); }

    function toggleSearch() {
        setSearchOpen(v => { if (!v) setTimeout(() => searchRef.current?.focus(), 60); return !v; });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    const lineBase: React.CSSProperties = {
        display: "block", width: "20px", height: "2px",
        backgroundColor: "#fff", borderRadius: "2px",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
        transformOrigin: "center",
    };

    return (
        <header style={{ position: "sticky", top: 0, zIndex: 50 }}>

            {/* TOP UTILITY BAR */}
            <div style={{ backgroundColor: "#111", borderBottom: "1px solid #222" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "3.6rem", padding: "0 1.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", animation: "navPulse 2s ease-in-out infinite" }} />
                        <span style={{ fontFamily: f, fontSize: "1.05rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <a href="/about" style={{ fontFamily: f, fontSize: "1.15rem", fontWeight: 600, color: isActive("/about") ? "#fff" : "#666", padding: "0.3rem 0.9rem", textDecoration: "none" }}>About</a>
                        <a href="/contact" style={{ fontFamily: f, fontSize: "1.15rem", fontWeight: 600, color: isActive("/contact") ? "#fff" : "#666", padding: "0.3rem 0.9rem", textDecoration: "none" }}>Contact</a>
                        <span style={{ width: "1px", height: "1.4rem", backgroundColor: "#333", margin: "0 0.4rem" }} />
                        <a href="/betting" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 1.1rem", borderRadius: "10rem", backgroundColor: "#ff6b00", color: "#fff", fontFamily: f, fontSize: "1.1rem", fontWeight: 700, textDecoration: "none" }}>
                            🎯 Betting Tips
                        </a>
                        <button onClick={toggleSearch} aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer", color: searchOpen ? "#fff" : "#555", padding: "0.4rem 0.6rem", lineHeight: 0, marginLeft: "0.2rem" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        </button>
                    </div>
                </div>
                <div style={{ overflow: "hidden", maxHeight: searchOpen ? "5.6rem" : "0", transition: "max-height 0.22s ease", borderTop: searchOpen ? "1px solid #222" : "none" }}>
                    <form onSubmit={handleSearch} style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0.7rem 1.6rem", display: "flex", gap: "0.8rem" }}>
                        <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search articles…" style={{ flex: 1, padding: "0.55rem 1.2rem", backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "0.4rem", color: "#fff", fontFamily: f, fontSize: "1.3rem", outline: "none" }} />
                        <button type="submit" style={{ padding: "0.55rem 1.4rem", backgroundColor: "#ff6b00", border: "none", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>Search</button>
                    </form>
                </div>
            </div>

            {/* MAIN NAV BAR */}
            <div style={{ backgroundColor: "#000", borderBottom: "1px solid #1a1a1a" }}>
                <div className="nav-inner">
                    <button onClick={toggleDrawer} aria-label="Toggle menu" aria-expanded={isOpen} style={{ marginRight: "1.4rem", flexShrink: 0, padding: "0.6rem", lineHeight: 0, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px" }}>
                        <span style={{ ...lineBase, transform: isOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
                        <span style={{ ...lineBase, opacity: isOpen ? 0 : 1 }} />
                        <span style={{ ...lineBase, transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
                    </button>
                    <a href="/" style={{ flexShrink: 0, marginRight: "2rem" }}>
                        <img src="/logo.png" alt="Sureodds" style={{ height: "3.4rem", width: "auto", display: "block" }} />
                    </a>
                    <nav className="nav-links">
                        {navItems.map(item => {
                            const href = `/category/${item.slug}`;
                            const active = isActive(href);
                            return (
                                <a key={item.slug} href={href} style={{ display: "flex", alignItems: "center", padding: "0 1rem", height: "5.6rem", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: active ? "#fff" : "#888", whiteSpace: "nowrap", borderBottom: active ? "2px solid #ff6b00" : "2px solid transparent", transition: "color 0.15s, border-color 0.15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; if (!active) e.currentTarget.style.borderBottomColor = "#ff6b00"; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = active ? "#fff" : "#888"; if (!active) e.currentTarget.style.borderBottomColor = "transparent"; }}
                                >{item.label}</a>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* BACKDROP */}
            {isMounted && (
                <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, top: "9.2rem", backgroundColor: "rgba(0,0,0,0.6)", zIndex: -1, opacity: isVisible ? 1 : 0, transition: "opacity 0.28s ease", backdropFilter: "blur(3px)" }} />
            )}

            {/* DRAWER */}
            {isMounted && (
                <div style={{ backgroundColor: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", transform: isVisible ? "translateY(0)" : "translateY(-1rem)", opacity: isVisible ? 1 : 0, transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease", overflow: "hidden" }}>
                    <div className="mobile-nav-links">
                        {navItems.map((item, idx) => {
                            const logo = LEAGUE_LOGOS[item.slug];
                            const accent = CATEGORY_COLORS[item.slug];
                            const isLocal = logo?.startsWith("/");
                            const href = `/category/${item.slug}`;
                            const active = isActive(href);
                            return (
                                <a key={item.slug} href={href} style={{ display: "flex", alignItems: "center", gap: "1.4rem", padding: "1.3rem 2rem", fontFamily: f, fontWeight: 600, fontSize: "1.5rem", color: active ? "#ff6b00" : "#1a1a1a", borderBottom: "1px solid #f0f0f0", textDecoration: "none", background: active ? "#fff7f0" : "transparent", transform: isVisible ? "translateX(0)" : "translateX(-1.6rem)", opacity: isVisible ? 1 : 0, transition: `transform 0.3s ease ${idx * 25}ms, opacity 0.22s ease ${idx * 25}ms` }}>
                                    {logo ? (
                                        <div style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.4rem", backgroundColor: isLocal ? (accent ?? "#68676d") : "transparent", padding: isLocal ? "0.3rem" : "0" }}>
                                            <img src={logo} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                        </div>
                                    ) : accent ? (
                                        <div style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0, borderRadius: "0.4rem", backgroundColor: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{item.label.slice(0, 2).toUpperCase()}</span>
                                        </div>
                                    ) : null}
                                    <span>{CATEGORY_LABELS[item.slug] ?? item.label}</span>
                                    {active && <svg style={{ marginLeft: "auto" }} width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M1 1l4 4-4 4" /></svg>}
                                </a>
                            );
                        })}
                        <div style={{ display: "flex", gap: "2rem", padding: "1.4rem 2rem", borderTop: "2px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                            <a href="/betting" style={{ fontFamily: f, fontSize: "1.35rem", fontWeight: 700, color: "#ff6b00", textDecoration: "none" }}>🎯 Betting Tips</a>
                            <a href="/about" style={{ fontFamily: f, fontSize: "1.35rem", fontWeight: 600, color: "#68676d", textDecoration: "none" }}>About</a>
                            <a href="/contact" style={{ fontFamily: f, fontSize: "1.35rem", fontWeight: 600, color: "#68676d", textDecoration: "none" }}>Contact</a>
                        </div>
                    </div>
                    <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "2.4rem 2rem" }} className="mega-grid desktop-mega">
                        {megaMenuSports.map(sport => (
                            <a key={sport.slug} href={`/category/${sport.slug}`} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0.8rem", fontFamily: f, fontWeight: 600, fontSize: "1.4rem", color: "#1a1a1a", borderBottom: "1px solid #f0f0f0", textDecoration: "none", borderRadius: "0.4rem", transition: "color 0.15s, background 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#ff6b00"; e.currentTarget.style.background = "#fff7f0"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <MegaIcon slug={sport.slug} label={sport.label} />
                                {sport.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <style>{`@keyframes navPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}`}</style>
        </header>
    );
}
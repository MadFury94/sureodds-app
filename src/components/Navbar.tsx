"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { fonts, LEAGUE_LOGOS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/config";

const f = fonts.body;

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
    { label: "News", slug: "news" },
    { label: "Transfer", slug: "transfer" },
    { label: "Breaking News", slug: "breaking-news" },
    { label: "Football Stories", slug: "football-stories" },
    { label: "La Liga", slug: "la-liga" },
    { label: "EPL", slug: "epl" },
    { label: "UCL", slug: "ucl" },
    { label: "AFCON", slug: "afcon" },
    { label: "International Football", slug: "international-football" },
    { label: "Blog", slug: "blog" },
];

const rightLinks = [
    { label: "Betting", href: "/betting" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

function MegaIcon({ slug, label }: { slug: string; label: string }) {
    const logo = LEAGUE_LOGOS[slug];
    const accentColor = CATEGORY_COLORS[slug] ?? "#68676d";
    const isLocal = logo?.startsWith("/");

    if (logo) {
        return (
            <div style={{
                width: "2.8rem", height: "2.8rem", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "0.4rem",
                backgroundColor: isLocal ? accentColor : "transparent",
                padding: isLocal ? "0.3rem" : "0",
            }}>
                <img src={logo} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
        );
    }
    return (
        <div style={{
            width: "2.8rem", height: "2.8rem", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "0.4rem", backgroundColor: accentColor,
        }}>
            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {label.slice(0, 2).toUpperCase()}
            </span>
        </div>
    );
}

type DrawerState = "closed" | "opening" | "open" | "closing";

export default function Navbar() {
    const [drawerState, setDrawerState] = useState<DrawerState>("closed");
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    function toggleDrawer() {
        if (isOpen) closeDrawer(); else openDrawer();
    }

    useEffect(() => {
        closeDrawer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => () => {
        document.body.style.overflow = "";
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    // Hamburger line animation
    const lineBase: React.CSSProperties = {
        display: "block", width: "22px", height: "2px",
        backgroundColor: "#fff", borderRadius: "2px",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
        transformOrigin: "center",
    };

    return (
        <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#000" }}>
            <div style={{ borderBottom: "1px solid #27262a" }}>
                <div className="nav-inner">
                    {/* Animated hamburger */}
                    <button
                        onClick={toggleDrawer}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isOpen}
                        style={{
                            color: "#fff", marginRight: "1.2rem", flexShrink: 0,
                            padding: "0.6rem", lineHeight: 0, background: "none",
                            border: "none", cursor: "pointer",
                            display: "flex", flexDirection: "column", gap: "5px",
                        }}
                    >
                        <span style={{
                            ...lineBase,
                            transform: isOpen ? "translateY(7px) rotate(45deg)" : "none",
                        }} />
                        <span style={{
                            ...lineBase,
                            opacity: isOpen ? 0 : 1,
                            transform: isOpen ? "scaleX(0)" : "none",
                        }} />
                        <span style={{
                            ...lineBase,
                            transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none",
                        }} />
                    </button>

                    {/* Logo */}
                    <a href="/" style={{ flexShrink: 0, marginRight: "1.6rem" }}>
                        <img src="/logo.png" alt="Sureodds" style={{ height: "4rem", width: "auto", display: "block" }} />
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

            {/* Backdrop */}
            {isMounted && (
                <div
                    onClick={closeDrawer}
                    style={{
                        position: "fixed", inset: 0, top: "7.2rem",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: -1,
                        opacity: isVisible ? 1 : 0,
                        transition: "opacity 0.28s ease",
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Drawer panel */}
            {isMounted && (
                <div style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                    transform: isVisible ? "translateY(0)" : "translateY(-1.2rem)",
                    opacity: isVisible ? 1 : 0,
                    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
                    overflow: "hidden",
                }}>
                    {/* Mobile nav list */}
                    <div className="mobile-nav-links">
                        {[
                            ...navItems.map((i, idx) => ({
                                label: CATEGORY_LABELS[i.slug] ?? i.label,
                                shortLabel: i.label,
                                href: `/category/${i.slug}`,
                                slug: i.slug,
                                idx,
                            })),
                            ...rightLinks.map((l, idx) => ({
                                label: l.label, shortLabel: l.label,
                                href: l.href, slug: "", idx: navItems.length + idx,
                            })),
                        ].map((item) => {
                            const logo = LEAGUE_LOGOS[item.slug];
                            const accent = CATEGORY_COLORS[item.slug];
                            const isLocal = logo?.startsWith("/");
                            const active = isActive(item.href);
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "1.4rem",
                                        padding: "1.4rem 2rem",
                                        fontFamily: f, fontWeight: 600, fontSize: "1.55rem",
                                        color: active ? "#e9173d" : "#1a1a1a",
                                        borderBottom: "1px solid #f0f0f0",
                                        textDecoration: "none",
                                        background: active ? "#fff5f7" : "transparent",
                                        transform: isVisible ? "translateX(0)" : "translateX(-1.6rem)",
                                        opacity: isVisible ? 1 : 0,
                                        transition: `transform 0.32s cubic-bezier(0.4,0,0.2,1) ${item.idx * 30}ms, opacity 0.24s ease ${item.idx * 30}ms`,
                                    }}
                                >
                                    {logo ? (
                                        <div style={{
                                            width: "3rem", height: "3rem", flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            borderRadius: "0.5rem",
                                            backgroundColor: isLocal ? (accent ?? "#009a44") : "transparent",
                                            padding: isLocal ? "0.3rem" : "0",
                                        }}>
                                            <img src={logo} alt={item.shortLabel} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                        </div>
                                    ) : accent ? (
                                        <div style={{
                                            width: "3rem", height: "3rem", flexShrink: 0,
                                            borderRadius: "0.5rem", backgroundColor: accent,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                                                {item.shortLabel.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    ) : null}
                                    <span>{item.label}</span>
                                    {active && (
                                        <svg style={{ marginLeft: "auto" }} width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#e9173d" strokeWidth="2">
                                            <path d="M1 1l4 4-4 4" />
                                        </svg>
                                    )}
                                </a>
                            );
                        })}
                    </div>

                    {/* Desktop mega grid */}
                    <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "2.4rem 2rem" }} className="mega-grid desktop-mega">
                        {megaMenuSports.map((sport) => (
                            <a key={sport.label} href={`/category/${sport.slug}`} style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                padding: "1rem 0.8rem",
                                fontFamily: f, fontWeight: 600, fontSize: "1.4rem",
                                color: "#1a1a1a", borderBottom: "1px solid #eee",
                                textDecoration: "none",
                                borderRadius: "0.4rem",
                                transition: "color 0.15s, background 0.15s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#e9173d"; e.currentTarget.style.background = "#fff5f7"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <MegaIcon slug={sport.slug} label={sport.label} />
                                {CATEGORY_LABELS[sport.slug] ?? sport.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}

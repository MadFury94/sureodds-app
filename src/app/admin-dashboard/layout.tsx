"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const FULL_NAV = [
    { label: "Dashboard", href: "/admin-dashboard", icon: "▦", indent: false },
    { label: "Posts", href: "/admin-dashboard/posts", icon: "📄", indent: false },
    { label: "Add New Post", href: "/admin-dashboard/new-post", icon: "✎", indent: true },
    { label: "All Posts", href: "/admin-dashboard/posts", icon: "≡", indent: true },
    { label: "Categories", href: "/admin-dashboard/categories", icon: "◈", indent: true },
    { label: "Media", href: "/admin-dashboard/media", icon: "⊞", indent: false },
    { label: "Betting Tips", href: "/admin-dashboard/tips", icon: "🎯", indent: false },
    { label: "Users", href: "/admin-dashboard/users", icon: "👥", indent: false },
    { label: "Settings", href: "/admin-dashboard/settings", icon: "⚙", indent: false },
];

// Tips-admin only sees the Betting Tips page, but punters see everything
const TIPS_ADMIN_NAV = [
    { label: "Betting Tips", href: "/admin-dashboard/tips", icon: "🎯", indent: false },
];

const PUNTER_NAV = [
    { label: "Dashboard", href: "/admin-dashboard", icon: "▦", indent: false },
    { label: "Posts", href: "/admin-dashboard/posts", icon: "📄", indent: false },
    { label: "Add New Post", href: "/admin-dashboard/new-post", icon: "✎", indent: true },
    { label: "All Posts", href: "/admin-dashboard/posts", icon: "≡", indent: true },
    { label: "Betting Tips", href: "/admin-dashboard/tips", icon: "🎯", indent: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; avatar?: string; role?: string } | null>(null);

    useEffect(() => {
        // Check for punter/tips-admin session first (so_user_session)
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(d => {
                if (d.user?.role === "tips-admin" || d.user?.role === "punter") {
                    // Check if user is pending approval
                    if (d.user.status === "pending") {
                        window.location.href = "/register/pending";
                        return;
                    }
                    // Check if user is suspended
                    if (d.user.status === "suspended") {
                        window.location.href = "/login";
                        return;
                    }
                    // User is active
                    setUser({ ...d.user });
                    return;
                }
                // If not a punter/tips-admin, check WP admin session
                fetch("/api/wordpress-auth")
                    .then(r => r.json())
                    .then(d => { if (d.valid) setUser(d.user); })
                    .catch(() => { });
            })
            .catch(() => {
                // Also check WP admin session if user session fails
                fetch("/api/wordpress-auth")
                    .then(r => r.json())
                    .then(d => { if (d.valid) setUser(d.user); })
                    .catch(() => { });
            });
    }, []);

    async function handleLogout() {
        await fetch("/api/wordpress-auth", { method: "DELETE" });
        router.push("/admin-login");
    }

    const isTipsAdmin = user?.role === "tips-admin";
    const isPunter = user?.role === "punter";
    const NAV = isTipsAdmin ? TIPS_ADMIN_NAV : isPunter ? PUNTER_NAV : FULL_NAV;

    const isActive = (href: string) =>
        href === "/admin-dashboard" ? pathname === href : pathname.startsWith(href);

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f2f5f6", fontFamily: f }}>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'show' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* ── Sidebar ── */}
            <aside style={{
                width: sidebarOpen ? "24rem" : "6.4rem",
                backgroundColor: "#0f0f0f",
                display: "flex", flexDirection: "column",
                transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
                flexShrink: 0, position: "sticky", top: 0, height: "100vh",
                overflow: "hidden",
            }} className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                {/* Logo + toggle */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "2rem 1.6rem", borderBottom: "1px solid #1e1e1e",
                    minHeight: "7rem",
                }}>
                    {sidebarOpen && (
                        <a href="/" target="_blank" style={{ flexShrink: 0 }}>
                            <img src="/logo.png" alt="Sureodds" style={{ height: "3.2rem", width: "auto" }} />
                        </a>
                    )}
                    <button onClick={() => setSidebarOpen(v => !v)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#68676d", padding: "0.4rem", lineHeight: 0,
                        marginLeft: sidebarOpen ? "auto" : "auto",
                    }} aria-label="Toggle sidebar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {sidebarOpen
                                ? <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                            }
                        </svg>
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: "1.2rem 0", overflowY: "auto" }}>
                    {NAV.map(item => {
                        const active = item.href === "/admin-dashboard"
                            ? pathname === item.href
                            : pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/admin-dashboard/posts");
                        return (
                            <a key={item.label + item.href} href={item.href} style={{
                                display: "flex", alignItems: "center",
                                gap: "1.2rem",
                                padding: item.indent ? "0.75rem 1.6rem 0.75rem 3.4rem" : "1.1rem 1.6rem",
                                color: active ? "#fff" : item.indent ? "#b0afb5" : "#ffffff",
                                backgroundColor: active ? "rgba(255,107,0,0.15)" : "transparent",
                                textDecoration: "none", whiteSpace: "nowrap",
                                borderRadius: "0.6rem",
                                margin: item.indent ? "0 0.8rem" : "0.2rem 0.8rem",
                                transition: "background 0.15s, color 0.15s",
                                fontFamily: f,
                                fontWeight: active ? 700 : item.indent ? 400 : 600,
                                fontSize: item.indent ? "1.3rem" : "1.4rem",
                                borderLeft: active ? "3px solid #ff6b00" : "3px solid transparent",
                            }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "#1e1e1e"; e.currentTarget.style.color = "#fff"; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = active ? "#fff" : item.indent ? "#b0afb5" : "#ffffff"; } }}
                            >
                                <span style={{ fontSize: item.indent ? "1.2rem" : "1.6rem", flexShrink: 0, width: "2rem", textAlign: "center" }}>{item.icon}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {/* User footer */}
                {user && (
                    <div style={{
                        padding: "1.6rem", borderTop: "1px solid #1e1e1e",
                        display: "flex", alignItems: "center", gap: "1rem",
                    }}>
                        <div style={{
                            width: "3.6rem", height: "3.6rem", borderRadius: "50%", flexShrink: 0,
                            backgroundColor: "#ff6b00", overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{user.name.slice(0, 2).toUpperCase()}</span>
                            }
                        </div>
                        {sidebarOpen && (
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                                <button onClick={handleLogout} style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    fontFamily: f, fontSize: "1.1rem", color: "#68676d", padding: 0,
                                }}>Sign out</button>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* ── Main content ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Top bar */}
                <header style={{
                    backgroundColor: "#fff", borderBottom: "1px solid #e8ebed",
                    padding: "0 2.4rem", height: "6.4rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Admin
                        </span>
                        <span style={{ color: "#e8ebed" }}>|</span>
                        <a href="/" target="_blank" style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textDecoration: "none" }}>
                            ↗ View Site
                        </a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                        <a href="/admin-dashboard/new-post" style={{
                            display: "flex", alignItems: "center", gap: "0.6rem",
                            padding: "0.8rem 1.8rem", backgroundColor: "#ff6b00",
                            color: "#fff", borderRadius: "0.6rem",
                            fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                            textDecoration: "none",
                        }}>
                            + New Post
                        </a>
                    </div>
                </header>

                <main style={{ flex: 1, padding: "2.4rem", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

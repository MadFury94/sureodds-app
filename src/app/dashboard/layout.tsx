"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const NAV = [
    { label: "Dashboard", href: "/dashboard", icon: "▦" },
    { label: "Betting Tips", href: "/dashboard/tips", icon: "🎯" },
    { label: "Latest Posts", href: "/dashboard/posts", icon: "📰" },
    { label: "My Profile", href: "/dashboard/profile", icon: "👤" },
];

interface UserData {
    id: string; name: string; email: string;
    status: string; subscriptionExpiry: string | null; role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [checked, setChecked] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Skip this layout for punter routes - they have their own layout
    const isPunterRoute = pathname.startsWith("/dashboard/punter");

    useEffect(() => {
        if (isPunterRoute) {
            // Just render children for punter routes
            setChecked(true);
            return;
        }

        fetch("/api/auth/me")
            .then(r => r.json())
            .then(d => {
                console.log("[Dashboard] Auth response:", d);
                if (!d.user) {
                    console.log("[Dashboard] No user, redirecting to login");
                    router.replace("/login");
                    return;
                }

                // Redirect punters to their dashboard
                if (d.user.role === "punter") {
                    console.log("[Dashboard] Punter detected, redirecting to /dashboard/punter");
                    router.replace("/dashboard/punter");
                    return;
                }

                console.log("[Dashboard] Checking status:", d.user.status);
                if (d.user.status !== "active") { router.replace("/subscribe"); return; }
                const expiry = d.user.subscriptionExpiry ? new Date(d.user.subscriptionExpiry) : null;
                if (expiry && expiry < new Date()) { router.replace("/subscribe?expired=1"); return; }
                setUser(d.user);
                setChecked(true);
            })
            .catch(() => router.replace("/login"));
    }, [router, isPunterRoute]);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    // For punter routes, just render children (they have their own layout)
    if (isPunterRoute) {
        return <>{children}</>;
    }

    if (!checked) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f2f5f6" }}>
                <div className="skeleton" style={{ width: "24rem", height: "4rem", borderRadius: "0.6rem" }} />
            </div>
        );
    }

    const daysLeft = user?.subscriptionExpiry
        ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / 86400000))
        : 0;

    const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f2f5f6", fontFamily: f }}>
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'show' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside style={{ width: "24rem", backgroundColor: "#0f0f0f", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }} className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div style={{ padding: "2.4rem 1.6rem 2rem", borderBottom: "1px solid #1e1e1e" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3rem", width: "auto" }} /></a>
                </div>

                {/* Subscription badge */}
                <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #1e1e1e" }}>
                    <div style={{ backgroundColor: daysLeft <= 5 ? "rgba(255,107,0,0.15)" : "rgba(34,197,94,0.1)", borderRadius: "0.6rem", padding: "1rem 1.2rem", border: `1px solid ${daysLeft <= 5 ? "rgba(255,107,0,0.3)" : "rgba(34,197,94,0.2)"}` }}>
                        <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: daysLeft <= 5 ? "#ff6b00" : "#22c55e", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.2rem" }}>
                            {daysLeft <= 5 ? "⚠ Expiring Soon" : "✓ Active"}
                        </p>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#888", margin: 0 }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "1.2rem 0" }}>
                    {NAV.map(item => {
                        const active = isActive(item.href);
                        return (
                            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "1.1rem 1.6rem", margin: "0.2rem 0.8rem", borderRadius: "0.6rem", color: active ? "#fff" : "#888", backgroundColor: active ? "rgba(255,107,0,0.15)" : "transparent", borderLeft: active ? "3px solid #ff6b00" : "3px solid transparent", fontFamily: f, fontWeight: active ? 700 : 500, fontSize: "1.4rem", textDecoration: "none", transition: "all 0.15s" }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "#1e1e1e"; e.currentTarget.style.color = "#fff"; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#888"; } }}
                            >
                                <span style={{ fontSize: "1.6rem", width: "2rem", textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                {/* User footer */}
                {user && (
                    <div style={{ padding: "1.6rem", borderTop: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "3.6rem", height: "3.6rem", borderRadius: "50%", backgroundColor: "#ff6b00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{user.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: f, fontSize: "1.1rem", color: "#68676d", padding: 0 }}>Sign out</button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ebed", padding: "0 2.4rem", height: "6.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
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
                        <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Members Area
                        </span>
                    </div>
                    <a href="/" style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textDecoration: "none" }}>↗ Back to Site</a>
                </header>
                <main style={{ flex: 1, padding: "2.4rem", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

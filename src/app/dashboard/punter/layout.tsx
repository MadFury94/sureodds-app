"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface MenuItem {
    label: string;
    href?: string;
    icon: string;
    submenu?: { label: string; href: string }[];
}

const NAV: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard/punter", icon: "▦" },
    {
        label: "Predictions",
        icon: "🎯",
        submenu: [
            { label: "All Predictions", href: "/dashboard/punter/predictions" },
            { label: "Add New", href: "/dashboard/punter/new-prediction" },
        ],
    },
    {
        label: "Bet Codes",
        icon: "🎫",
        submenu: [
            { label: "All Bet Codes", href: "/dashboard/punter/bet-codes" },
            { label: "Add New", href: "/dashboard/punter/bet-codes/new" },
        ],
    },
    { label: "Write Article", href: "/admin-dashboard/new-post", icon: "✍️" },
    { label: "My Profile", href: "/dashboard/profile", icon: "👤" },
];

interface UserData {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
}

export default function PunterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [checked, setChecked] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(["Predictions", "Bet Codes"]);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((d) => {
                console.log("Auth response:", d);
                if (!d.user) {
                    console.log("No user, redirecting to login");
                    router.replace("/login");
                    return;
                }
                console.log("User role:", d.user.role, "Status:", d.user.status);
                if (d.user.role !== "punter") {
                    console.log("Not a punter, redirecting to dashboard");
                    router.replace("/dashboard");
                    return;
                }
                if (d.user.status !== "active") {
                    console.log("Not active, redirecting to pending");
                    router.replace("/register/pending");
                    return;
                }
                console.log("Setting user and checked");
                setUser(d.user);
                setChecked(true);
            })
            .catch((err) => {
                console.error("Auth error:", err);
                router.replace("/login");
            });
    }, [router]);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) =>
            prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === "/dashboard/punter") return pathname === href;
        return pathname.startsWith(href);
    };

    const isSubmenuActive = (submenu: { label: string; href: string }[]) => {
        return submenu.some((item) => pathname.startsWith(item.href));
    };

    if (!checked) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f2f5f6",
                }}
            >
                <div
                    className="skeleton"
                    style={{ width: "24rem", height: "4rem", borderRadius: "0.6rem" }}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f2f5f6",
                fontFamily: f,
            }}
        >
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'show' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside
                style={{
                    width: "26rem",
                    backgroundColor: "#0f0f0f",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflowY: "auto",
                }}
                className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}
            >
                <div
                    style={{
                        padding: "2.4rem 1.6rem 2rem",
                        borderBottom: "1px solid #1e1e1e",
                    }}
                >
                    <a href="/">
                        <img
                            src="/logo.png"
                            alt="Sureodds"
                            style={{ height: "3rem", width: "auto" }}
                        />
                    </a>
                </div>

                {/* Role badge */}
                <div
                    style={{
                        padding: "1.4rem 1.6rem",
                        borderBottom: "1px solid #1e1e1e",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "rgba(255,107,0,0.15)",
                            borderRadius: "0.6rem",
                            padding: "1rem 1.2rem",
                            border: "1px solid rgba(255,107,0,0.3)",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: f,
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#ff6b00",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                margin: "0 0 0.2rem",
                            }}
                        >
                            🎯 Punter Account
                        </p>
                        <p
                            style={{
                                fontFamily: f,
                                fontSize: "1.2rem",
                                color: "#888",
                                margin: 0,
                            }}
                        >
                            Content Creator
                        </p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "1.2rem 0" }}>
                    {NAV.map((item) => {
                        const hasSubmenu = !!item.submenu;
                        const isExpanded = expandedMenus.includes(item.label);
                        const active = item.href ? isActive(item.href) : false;
                        const submenuActive = hasSubmenu
                            ? isSubmenuActive(item.submenu!)
                            : false;

                        return (
                            <div key={item.label} style={{ margin: "0.2rem 0" }}>
                                {/* Parent Menu Item */}
                                {hasSubmenu ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1.2rem",
                                            padding: "1.1rem 1.6rem",
                                            margin: "0 0.8rem",
                                            borderRadius: "0.6rem",
                                            color: submenuActive ? "#fff" : "#888",
                                            backgroundColor: submenuActive
                                                ? "rgba(255,107,0,0.1)"
                                                : "transparent",
                                            border: "none",
                                            borderLeft: submenuActive
                                                ? "3px solid #ff6b00"
                                                : "3px solid transparent",
                                            fontFamily: f,
                                            fontWeight: submenuActive ? 700 : 500,
                                            fontSize: "1.4rem",
                                            textDecoration: "none",
                                            transition: "all 0.15s",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!submenuActive) {
                                                e.currentTarget.style.backgroundColor = "#1e1e1e";
                                                e.currentTarget.style.color = "#fff";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!submenuActive) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = "#888";
                                            }
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "1.6rem",
                                                width: "2rem",
                                                textAlign: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        <span
                                            style={{
                                                fontSize: "1.2rem",
                                                transition: "transform 0.2s",
                                                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                            }}
                                        >
                                            ▶
                                        </span>
                                    </button>
                                ) : (
                                    <a
                                        href={item.href}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1.2rem",
                                            padding: "1.1rem 1.6rem",
                                            margin: "0 0.8rem",
                                            borderRadius: "0.6rem",
                                            color: active ? "#fff" : "#888",
                                            backgroundColor: active
                                                ? "rgba(255,107,0,0.15)"
                                                : "transparent",
                                            borderLeft: active
                                                ? "3px solid #ff6b00"
                                                : "3px solid transparent",
                                            fontFamily: f,
                                            fontWeight: active ? 700 : 500,
                                            fontSize: "1.4rem",
                                            textDecoration: "none",
                                            transition: "all 0.15s",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.backgroundColor = "#1e1e1e";
                                                e.currentTarget.style.color = "#fff";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = "#888";
                                            }
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "1.6rem",
                                                width: "2rem",
                                                textAlign: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </a>
                                )}

                                {/* Submenu */}
                                {hasSubmenu && isExpanded && (
                                    <div style={{ paddingLeft: "3.8rem", marginTop: "0.4rem" }}>
                                        {item.submenu!.map((subitem) => {
                                            const subActive = isActive(subitem.href);
                                            return (
                                                <a
                                                    key={subitem.href}
                                                    href={subitem.href}
                                                    style={{
                                                        display: "block",
                                                        padding: "0.8rem 1.6rem",
                                                        margin: "0.2rem 0.8rem 0.2rem 0",
                                                        borderRadius: "0.4rem",
                                                        color: subActive ? "#ff6b00" : "#888",
                                                        backgroundColor: subActive
                                                            ? "rgba(255,107,0,0.1)"
                                                            : "transparent",
                                                        fontFamily: f,
                                                        fontWeight: subActive ? 600 : 400,
                                                        fontSize: "1.3rem",
                                                        textDecoration: "none",
                                                        transition: "all 0.15s",
                                                        borderLeft: subActive
                                                            ? "2px solid #ff6b00"
                                                            : "2px solid transparent",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!subActive) {
                                                            e.currentTarget.style.backgroundColor =
                                                                "rgba(255,255,255,0.05)";
                                                            e.currentTarget.style.color = "#fff";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!subActive) {
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                            e.currentTarget.style.color = "#888";
                                                        }
                                                    }}
                                                >
                                                    {subitem.label}
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* User footer */}
                {user && (
                    <div
                        style={{
                            borderTop: "1px solid #1e1e1e",
                        }}
                    >
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1.2rem 1.6rem",
                                color: "#888",
                                textDecoration: "none",
                                fontFamily: f,
                                fontSize: "1.3rem",
                                fontWeight: 500,
                                borderBottom: "1px solid #1e1e1e",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#1e1e1e";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#888";
                            }}
                        >
                            <span style={{ fontSize: "1.6rem" }}>↗</span>
                            View Site
                        </a>
                        <div
                            style={{
                                padding: "1.6rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "3.6rem",
                                    height: "3.6rem",
                                    borderRadius: "50%",
                                    backgroundColor: "#ff6b00",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: f,
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                    }}
                                >
                                    {user.name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <p
                                    style={{
                                        fontFamily: f,
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        margin: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {user.name}
                                </p>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontFamily: f,
                                        fontSize: "1.1rem",
                                        color: "#68676d",
                                        padding: 0,
                                    }}
                                >
                                    Sign out
                                </button>
                            </div>
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
                            Punter Dashboard
                        </span>
                    </div>
                </header>
                <main style={{ flex: 1, padding: "2.4rem", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

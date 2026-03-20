"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { fonts, colors } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const LEAGUE_ACCENT: Record<string, string> = {
    "Champions League": "#1a1f71",
    "Premier League": "#38003c",
    "La Liga": "#ff4b00",
    "Serie A": "#003399",
    "Bundesliga": "#d20515",
    "AFCON": "#009a44",
    "Europa League": "#f77f00",
};

const CONFIDENCE_COLOR: Record<string, string> = {
    Low: "#99989f", Medium: "#f59e0b", High: "#22c55e", Banker: "#ff6b00",
};

const RESULT_STYLE: Record<string, React.CSSProperties> = {
    won: { backgroundColor: "#f0fdf4", border: "1.5px solid #22c55e", color: "#16a34a" },
    lost: { backgroundColor: "#fff1f2", border: "1.5px solid #ff6b00", color: "#ff6b00" },
    pending: { backgroundColor: "#f2f5f6", border: "1.5px solid #e8ebed", color: "#68676d" },
};
const RESULT_LABEL: Record<string, string> = { won: "✓ Won", lost: "✗ Lost", pending: "⏳ Pending" };

interface Tip {
    id: string | number;
    league?: string;
    match?: string;
    home?: string;
    away?: string;
    tip?: string;
    outcome?: string;
    odds: string;
    confidence?: string;
    analysis?: string;
    date?: string;
    matchDate?: string;
    result?: "won" | "lost" | "pending" | "";
}

interface UserData { status: string; role: string; subscriptionExpiry: string | null; }

// ── Blurred tip card (teaser) ─────────────────────────────────────────────
function LockedTipCard({ accent }: { accent: string }) {
    return (
        <div style={{ border: "1.5px solid #e8ebed", borderRadius: "1.2rem", overflow: "hidden", backgroundColor: "#fff", filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
            <div style={{ backgroundColor: accent, padding: "1rem 1.6rem", height: "4rem" }} />
            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={{ height: "4rem", backgroundColor: "#f2f5f6", borderRadius: "0.4rem" }} />
                <div style={{ height: "2rem", backgroundColor: "#f2f5f6", borderRadius: "0.4rem", width: "70%" }} />
                <div style={{ height: "6rem", backgroundColor: "#f2f5f6", borderRadius: "0.4rem" }} />
            </div>
        </div>
    );
}

// ── Subscription CTA ──────────────────────────────────────────────────────
function SubscribeCTA({ tipCount }: { tipCount: number }) {
    return (
        <div style={{ position: "relative", gridColumn: "1 / -1", marginTop: "-2rem" }}>
            {/* Fade overlay */}
            <div style={{ position: "absolute", top: "-12rem", left: 0, right: 0, height: "12rem", background: "linear-gradient(to bottom, transparent, #fff)", pointerEvents: "none", zIndex: 1 }} />
            <div style={{ position: "relative", zIndex: 2, backgroundColor: "#0f0f0f", borderRadius: "1.6rem", padding: "4rem 3.2rem", textAlign: "center", border: "1px solid #1e1e1e" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: "10rem", padding: "0.5rem 1.4rem", marginBottom: "2rem" }}>
                    <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: "#ff6b00", display: "inline-block" }} />
                    <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Members Only</span>
                </div>
                <h2 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 1.2rem", lineHeight: 1.15 }}>
                    🔒 {tipCount} Expert Tips Waiting
                </h2>
                <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#888", maxWidth: "52rem", margin: "0 auto 3.2rem", lineHeight: 1.6 }}>
                    Subscribe to unlock all daily tips, expert analysis, odds, and win/loss tracking from our specialist analysts.
                </p>
                <div style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", padding: "1.4rem 3.2rem", backgroundColor: "#ff6b00", borderRadius: "0.8rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Subscribe Now →
                    </a>
                    <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", padding: "1.4rem 3.2rem", backgroundColor: "transparent", border: "1.5px solid #333", borderRadius: "0.8rem", fontFamily: f, fontSize: "1.5rem", fontWeight: 600, color: "#aaa", textDecoration: "none" }}>
                        Already a member? Sign in
                    </a>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "3.2rem", marginTop: "3.2rem", paddingTop: "2.4rem", borderTop: "1px solid #1e1e1e", flexWrap: "wrap" }}>
                    {["Daily expert tips", "Win/loss tracking", "Odds & analysis", "Members dashboard"].map(item => (
                        <span key={item} style={{ fontFamily: f, fontSize: "1.3rem", color: "#555", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "#ff6b00" }}>✓</span> {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Tip card (visible) ────────────────────────────────────────────────────
function TipCard({ tip }: { tip: Tip }) {
    const accent = LEAGUE_ACCENT[tip.league ?? ""] ?? "#1a1a1a";
    const confColor = CONFIDENCE_COLOR[tip.confidence ?? ""] ?? "#68676d";
    const resultStyle = RESULT_STYLE[tip.result ?? "pending"];
    const matchLabel = tip.match ?? `${tip.home ?? ""} vs ${tip.away ?? ""}`;
    const predLabel = tip.tip ?? tip.outcome ?? "";

    return (
        <div style={{ border: "1.5px solid #e8ebed", borderRadius: "1.2rem", overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s, transform 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
        >
            <div style={{ backgroundColor: accent, padding: "1rem 1.6rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>{tip.league ?? "Football"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    {tip.confidence && (
                        <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: confColor, backgroundColor: confColor + "22", border: `1px solid ${confColor}`, padding: "0.2rem 0.8rem", borderRadius: "10rem" }}>{tip.confidence}</span>
                    )}
                    <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, padding: "0.2rem 0.8rem", borderRadius: "10rem", ...resultStyle }}>{RESULT_LABEL[tip.result ?? "pending"]}</span>
                </div>
            </div>
            <div style={{ padding: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.4rem" }}>{matchLabel}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.4rem", flexWrap: "wrap" }}>
                    <span style={{ padding: "0.6rem 1.6rem", borderRadius: "10rem", backgroundColor: colors.primary, fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>⚽ {predLabel}</span>
                    <span style={{ padding: "0.6rem 1.4rem", borderRadius: "10rem", border: "2px solid #1a1a1a", fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a" }}>@ {tip.odds}</span>
                </div>
                {tip.analysis && (
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#3d3c41", lineHeight: 1.6, fontStyle: "italic", borderLeft: `3px solid ${accent}`, paddingLeft: "1.2rem", margin: "0 0 1.4rem" }}>"{tip.analysis}"</p>
                )}
                <div style={{ paddingTop: "1.2rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{tip.date ?? tip.matchDate ?? ""}</span>
                    <img src="/logo.png" alt="Sureodds" style={{ height: "1.8rem", width: "auto", opacity: 0.5 }} />
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function BettingPage() {
    const [tips, setTips] = useState<Tip[]>([]);
    const [user, setUser] = useState<UserData | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [activeLeague, setActiveLeague] = useState("All");

    useEffect(() => {
        fetch("/api/tips").then(r => r.json()).then(d => setTips(d.tips ?? d ?? [])).catch(() => setTips([]));
        fetch("/api/auth/me").then(r => r.json()).then(d => {
            setUser(d.user ?? null);
            setAuthChecked(true);
        }).catch(() => setAuthChecked(true));
    }, []);

    const isSubscriber = authChecked && user?.status === "active" &&
        (!user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date());

    // Free preview: show 2 tips, rest locked
    const PREVIEW_COUNT = 2;
    const visibleTips = isSubscriber ? tips : tips.slice(0, PREVIEW_COUNT);
    const lockedCount = isSubscriber ? 0 : Math.max(0, tips.length - PREVIEW_COUNT);

    const allLeagues = ["All", ...Array.from(new Set(tips.map(t => t.league ?? "").filter(Boolean)))];
    const filtered = visibleTips.filter(t => activeLeague === "All" || t.league === activeLeague);

    const bankers = tips.filter(t => t.confidence === "Banker").length;
    const highConf = tips.filter(t => t.confidence === "High").length;
    const wonToday = tips.filter(t => t.result === "won").length;

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <PageHeader
                title="Sure Odds"
                subtitle="Expert predictions from our specialist analysts. Updated daily."
                image="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80"
                badge="Expert Tips"
                badgeColor={colors.primary}
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>

                {/* Stats bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.6rem", marginBottom: "4rem" }} className="betting-stats-grid">
                    {[
                        { label: "Tips Today", value: tips.length, icon: "📋" },
                        { label: "Banker Tips", value: bankers, icon: "🔥" },
                        { label: "High Confidence", value: highConf, icon: "⚡" },
                        { label: "Won Today", value: wonToday, icon: "✅" },
                    ].map(stat => (
                        <div key={stat.label} style={{ backgroundColor: "#f2f5f6", borderRadius: "1rem", padding: "2rem", textAlign: "center", border: "1.5px solid #e8ebed" }}>
                            <div style={{ fontSize: "2.4rem", marginBottom: "0.4rem" }}>{stat.icon}</div>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "3rem", color: "#1a1a1a", lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.4rem" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* League filter */}
                {isSubscriber && (
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "3.2rem" }}>
                        {allLeagues.map(l => (
                            <button key={l} onClick={() => setActiveLeague(l)} style={{ padding: "0.6rem 1.4rem", borderRadius: "2rem", border: `2px solid ${activeLeague === l ? "#1a1a1a" : "#e8ebed"}`, backgroundColor: activeLeague === l ? "#1a1a1a" : "#fff", fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: activeLeague === l ? "#fff" : "#3d3c41", cursor: "pointer" }}>{l}</button>
                        ))}
                    </div>
                )}

                {/* Tips */}
                {tips.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>No tips posted yet today</p>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Check back soon — our analysts update tips daily.</p>
                        {!isSubscriber && (
                            <a href="/register" style={{ display: "inline-block", marginTop: "2.4rem", padding: "1.2rem 3.2rem", backgroundColor: "#ff6b00", borderRadius: "0.8rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>
                                Subscribe to Get Notified →
                            </a>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(38rem, 1fr))", gap: "2rem" }} className="tips-grid">
                        {filtered.map(tip => <TipCard key={tip.id} tip={tip} />)}

                        {/* Locked placeholders */}
                        {!isSubscriber && lockedCount > 0 && (
                            <>
                                {Array.from({ length: Math.min(lockedCount, 2) }).map((_, i) => (
                                    <LockedTipCard key={`locked-${i}`} accent={Object.values(LEAGUE_ACCENT)[i] ?? "#1a1a1a"} />
                                ))}
                                <SubscribeCTA tipCount={tips.length} />
                            </>
                        )}
                    </div>
                )}

                {/* Logged in but expired */}
                {authChecked && user && user.status !== "active" && (
                    <div style={{ marginTop: "3.2rem", backgroundColor: "#fff7f0", border: "1px solid #fed7aa", borderRadius: "1rem", padding: "2.4rem", textAlign: "center" }}>
                        <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#ff6b00", margin: "0 0 0.8rem" }}>Your subscription has expired</p>
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: "0 0 1.6rem" }}>Renew to continue accessing all tips.</p>
                        <a href="/subscribe" style={{ display: "inline-block", padding: "1rem 2.8rem", backgroundColor: "#ff6b00", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}>Renew Subscription</a>
                    </div>
                )}
            </div>
        </div>
    );
}

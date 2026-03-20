"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Tip {
    id: string; match: string; tip: string; odds: string;
    date: string; league?: string; result?: "win" | "loss" | "void" | "";
    confidence?: "high" | "medium" | "low";
}

const RESULT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    win: { bg: "#f0fdf4", color: "#16a34a", label: "✓ Win" },
    loss: { bg: "#fff0f0", color: "#dc2626", label: "✗ Loss" },
    void: { bg: "#f9fafb", color: "#68676d", label: "— Void" },
};

const CONFIDENCE_COLORS: Record<string, string> = {
    high: "#16a34a", medium: "#ff6b00", low: "#99989f",
};

export default function DashboardTips() {
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/tips")
            .then(r => r.json())
            .then(d => setTips(d.tips ?? []))
            .finally(() => setLoading(false));
    }, []);

    const today = new Date().toISOString().slice(0, 10);
    const todayTips = tips.filter(t => t.date === today);
    const pastTips = tips.filter(t => t.date < today).slice(0, 10);

    return (
        <div style={{ maxWidth: "80rem" }}>
            <div style={{ marginBottom: "2.4rem" }}>
                <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.4rem" }}>Betting Tips</h1>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>Expert picks updated daily.</p>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "9rem", borderRadius: "0.8rem" }} />)}
                </div>
            ) : (
                <>
                    {/* Today */}
                    <div style={{ marginBottom: "3.2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.6rem" }}>
                            <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase" }}>Today's Tips</span>
                            <span style={{ padding: "0.3rem 0.9rem", backgroundColor: "#ff6b00", borderRadius: "10rem", fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{todayTips.length}</span>
                        </div>
                        {todayTips.length === 0 ? (
                            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "3.2rem", textAlign: "center" }}>
                                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#99989f" }}>No tips posted for today yet. Check back soon.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                {todayTips.map(tip => <TipCard key={tip.id} tip={tip} />)}
                            </div>
                        )}
                    </div>

                    {/* Past */}
                    {pastTips.length > 0 && (
                        <div>
                            <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", display: "block", marginBottom: "1.6rem" }}>Recent Tips</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                {pastTips.map(tip => <TipCard key={tip.id} tip={tip} past />)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function TipCard({ tip, past }: { tip: Tip; past?: boolean }) {
    const f2 = fonts.body;
    const fd2 = fonts.display;
    const result = tip.result ? RESULT_STYLES[tip.result] : null;

    return (
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "1.8rem 2rem", opacity: past ? 0.85 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.6rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {tip.league && (
                        <span style={{ fontFamily: f2, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>{tip.league}</span>
                    )}
                    <p style={{ fontFamily: fd2, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.6rem" }}>{tip.match}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: f2, fontSize: "1.3rem", color: "#3d3c41" }}>{tip.tip}</span>
                        <span style={{ padding: "0.3rem 0.9rem", backgroundColor: "#fff7f0", borderRadius: "0.4rem", fontFamily: f2, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00" }}>@ {tip.odds}</span>
                        {tip.confidence && (
                            <span style={{ fontFamily: f2, fontSize: "1.1rem", fontWeight: 700, color: CONFIDENCE_COLORS[tip.confidence] ?? "#99989f", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {tip.confidence} confidence
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem", flexShrink: 0 }}>
                    <span style={{ fontFamily: f2, fontSize: "1.2rem", color: "#99989f" }}>{tip.date}</span>
                    {result && (
                        <span style={{ padding: "0.4rem 1rem", backgroundColor: result.bg, borderRadius: "0.4rem", fontFamily: f2, fontSize: "1.2rem", fontWeight: 700, color: result.color }}>
                            {result.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

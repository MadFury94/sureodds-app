"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface BetCode {
    id: string;
    bookmaker: string;
    code: string;
    link?: string;
    image?: string;
    description: string;
    odds: string;
    stake?: string;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "won" | "lost";
    category: "free" | "sure-banker" | "premium" | "vip";
    confidence?: string;
}

const CATEGORY_INFO = {
    free: { label: "Free Tips", icon: "🆓", color: "#22c55e", bgColor: "#f0fdf4" },
    "sure-banker": { label: "Sure Banker", icon: "🏦", color: "#ff6b00", bgColor: "#fff5f0" },
    premium: { label: "Premium", icon: "⭐", color: "#8b5cf6", bgColor: "#faf5ff" },
    vip: { label: "VIP Exclusive", icon: "👑", color: "#eab308", bgColor: "#fefce8" },
};

export default function BetCodesPublicPage() {
    const router = useRouter();
    const [betCodes, setBetCodes] = useState<BetCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("guest");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Check if user is logged in
            const userRes = await fetch("/api/auth/me");
            const userData = await userRes.json();
            setUser(userData.user);

            // Fetch bet codes
            const res = await fetch("/api/bet-codes");
            const data = await res.json();
            setBetCodes(data.betCodes || []);
            setUserRole(data.userRole || "guest");
        } catch (error) {
            console.error("Failed to load bet codes:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredBetCodes = selectedCategory === "all"
        ? betCodes
        : betCodes.filter(bc => bc.category === selectedCategory);

    const activeBetCodes = filteredBetCodes.filter(bc => bc.status === "active");

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
            {/* Header */}
            <div style={{ backgroundColor: "#1a1a1a", color: "#fff", padding: "3.2rem 2rem" }}>
                <div style={{ maxWidth: "120rem", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                        <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                            🎫 Bet Codes
                        </h1>
                        {!user ? (
                            <button
                                onClick={() => router.push("/auth/login")}
                                style={{
                                    padding: "1.2rem 2.4rem",
                                    backgroundColor: "#ff6b00",
                                    border: "none",
                                    borderRadius: "0.8rem",
                                    fontFamily: fd,
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Login to See More
                            </button>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                                <span style={{ fontFamily: f, fontSize: "1.4rem", opacity: 0.9 }}>
                                    Welcome, {user.name}
                                </span>
                                <button
                                    onClick={() => router.push("/dashboard/punter")}
                                    style={{
                                        padding: "1rem 2rem",
                                        backgroundColor: "transparent",
                                        border: "2px solid #fff",
                                        borderRadius: "0.8rem",
                                        fontFamily: f,
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        color: "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", opacity: 0.9, margin: 0 }}>
                        {userRole === "guest"
                            ? "Login to access premium bet codes and sure bankers"
                            : "Access exclusive bet codes from expert punters"}
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ebed", padding: "2rem" }}>
                <div style={{ maxWidth: "120rem", margin: "0 auto" }}>
                    <div style={{ display: "flex", gap: "1.2rem", overflowX: "auto" }}>
                        <button
                            onClick={() => setSelectedCategory("all")}
                            style={{
                                padding: "1rem 2rem",
                                border: "2px solid",
                                borderColor: selectedCategory === "all" ? "#ff6b00" : "#e8ebed",
                                backgroundColor: selectedCategory === "all" ? "#fff5f0" : "#fff",
                                borderRadius: "10rem",
                                fontFamily: fd,
                                fontSize: "1.3rem",
                                fontWeight: 700,
                                color: selectedCategory === "all" ? "#ff6b00" : "#68676d",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            All Categories
                        </button>
                        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                style={{
                                    padding: "1rem 2rem",
                                    border: "2px solid",
                                    borderColor: selectedCategory === key ? info.color : "#e8ebed",
                                    backgroundColor: selectedCategory === key ? info.bgColor : "#fff",
                                    borderRadius: "10rem",
                                    fontFamily: fd,
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    color: selectedCategory === key ? info.color : "#68676d",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.8rem",
                                }}
                            >
                                <span>{info.icon}</span>
                                <span>{info.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bet Codes Grid */}
            <div style={{ maxWidth: "120rem", margin: "0 auto", padding: "3.2rem 2rem" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "6rem" }}>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Loading bet codes...</p>
                    </div>
                ) : activeBetCodes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "6rem", backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed" }}>
                        <div style={{ fontSize: "6rem", marginBottom: "1.6rem", opacity: 0.3 }}>🎫</div>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", marginBottom: "1rem" }}>
                            No active bet codes in this category
                        </p>
                        {userRole === "guest" && (
                            <button
                                onClick={() => router.push("/auth/login")}
                                style={{
                                    padding: "1.2rem 3.2rem",
                                    backgroundColor: "#ff6b00",
                                    border: "none",
                                    borderRadius: "0.8rem",
                                    fontFamily: fd,
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Login to See More
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(36rem, 1fr))", gap: "2.4rem" }}>
                        {activeBetCodes.map((betCode) => {
                            const categoryInfo = CATEGORY_INFO[betCode.category];

                            return (
                                <div
                                    key={betCode.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "1.2rem",
                                        border: "2px solid #e8ebed",
                                        padding: "2.4rem",
                                        position: "relative",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    {/* Category Badge */}
                                    <div style={{
                                        position: "absolute",
                                        top: "1.6rem",
                                        right: "1.6rem",
                                        padding: "0.6rem 1.2rem",
                                        borderRadius: "10rem",
                                        backgroundColor: categoryInfo.bgColor,
                                        border: `2px solid ${categoryInfo.color}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.6rem",
                                    }}>
                                        <span style={{ fontSize: "1.4rem" }}>{categoryInfo.icon}</span>
                                        <span style={{ fontFamily: fd, fontSize: "1.1rem", fontWeight: 700, color: categoryInfo.color, textTransform: "uppercase" }}>
                                            {categoryInfo.label}
                                        </span>
                                    </div>

                                    {/* Bookmaker */}
                                    <div style={{ marginBottom: "1.6rem", paddingRight: "10rem" }}>
                                        <p style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
                                            {betCode.bookmaker}
                                        </p>
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: 0 }}>
                                            {new Date(betCode.createdAt).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>

                                    {/* Confidence Badge */}
                                    {betCode.confidence && (
                                        <div style={{
                                            display: "inline-block",
                                            padding: "0.6rem 1.2rem",
                                            backgroundColor: betCode.confidence === "Banker" ? "#dcfce7" : betCode.confidence === "High" ? "#fef3c7" : "#f3f4f6",
                                            borderRadius: "0.6rem",
                                            marginBottom: "1.6rem",
                                        }}>
                                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: betCode.confidence === "Banker" ? "#16a34a" : betCode.confidence === "High" ? "#ca8a04" : "#6b7280" }}>
                                                {betCode.confidence} Confidence
                                            </span>
                                        </div>
                                    )}

                                    {/* Code */}
                                    {betCode.code && (
                                        <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.8rem", padding: "1.6rem", marginBottom: "1.6rem", border: "2px solid #e8ebed" }}>
                                            <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: "0 0 0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                                Booking Code
                                            </p>
                                            <p style={{ fontFamily: "monospace", fontSize: "2.4rem", fontWeight: 700, color: "#ff6b00", margin: 0, letterSpacing: "0.1em" }}>
                                                {betCode.code}
                                            </p>
                                        </div>
                                    )}

                                    {/* Link */}
                                    {betCode.link && (
                                        <a
                                            href={betCode.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "block",
                                                padding: "1.4rem",
                                                backgroundColor: "#fff5f0",
                                                border: "2px solid #ff6b00",
                                                borderRadius: "0.8rem",
                                                fontFamily: fd,
                                                fontSize: "1.4rem",
                                                fontWeight: 700,
                                                color: "#ff6b00",
                                                textDecoration: "none",
                                                marginBottom: "1.6rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            🔗 Open Bet Slip
                                        </a>
                                    )}

                                    {/* Image */}
                                    {betCode.image && (
                                        <img
                                            src={betCode.image}
                                            alt="Bet slip"
                                            style={{
                                                width: "100%",
                                                borderRadius: "0.8rem",
                                                marginBottom: "1.6rem",
                                                border: "1px solid #e8ebed",
                                            }}
                                        />
                                    )}

                                    {/* Description */}
                                    {betCode.description && (
                                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#3d3c41", margin: "0 0 1.6rem", lineHeight: 1.6 }}>
                                            {betCode.description}
                                        </p>
                                    )}

                                    {/* Odds & Stake */}
                                    <div style={{ display: "flex", gap: "1.2rem" }}>
                                        {betCode.odds && (
                                            <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "0.8rem", padding: "1.2rem", border: "1px solid #e8ebed" }}>
                                                <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    Total Odds
                                                </p>
                                                <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                                    {betCode.odds}
                                                </p>
                                            </div>
                                        )}
                                        {betCode.stake && (
                                            <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "0.8rem", padding: "1.2rem", border: "1px solid #e8ebed" }}>
                                                <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    Stake
                                                </p>
                                                <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                                    ₦{betCode.stake}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expires */}
                                    {betCode.expiresAt && (
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "1.6rem 0 0", textAlign: "center" }}>
                                            Expires: {new Date(betCode.expiresAt).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

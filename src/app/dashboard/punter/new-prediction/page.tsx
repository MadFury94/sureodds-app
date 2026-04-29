"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function NewPredictionRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect after 3 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard/punter/bet-codes");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            padding: "2rem"
        }}>
            <div style={{
                maxWidth: "60rem",
                textAlign: "center",
                backgroundColor: "#fff",
                borderRadius: "1.6rem",
                padding: "4rem",
                border: "2px solid #e8ebed",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
                <div style={{ fontSize: "8rem", marginBottom: "2rem" }}>🎫</div>

                <h1 style={{
                    fontFamily: fd,
                    fontSize: "2.8rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    margin: "0 0 1.6rem"
                }}>
                    Feature Updated
                </h1>

                <p style={{
                    fontFamily: f,
                    fontSize: "1.6rem",
                    color: "#68676d",
                    lineHeight: 1.6,
                    marginBottom: "2.4rem"
                }}>
                    We've simplified the prediction process! Instead of creating full betslips,
                    you can now share bet codes directly from your bookmaker.
                </p>

                <div style={{
                    backgroundColor: "#fff5f0",
                    border: "2px solid #ff6b00",
                    borderRadius: "1rem",
                    padding: "2rem",
                    marginBottom: "3rem",
                }}>
                    <p style={{
                        fontFamily: f,
                        fontSize: "1.4rem",
                        color: "#1a1a1a",
                        margin: 0,
                        lineHeight: 1.6,
                    }}>
                        <strong>What's changed?</strong><br />
                        Share booking codes from Bet9ja, SportyBet, 1xBet, and other bookmakers.
                        It's faster and easier for your subscribers to use!
                    </p>
                </div>

                <button
                    onClick={() => router.push("/dashboard/punter/bet-codes")}
                    style={{
                        padding: "1.6rem 4rem",
                        backgroundColor: "#ff6b00",
                        border: "none",
                        borderRadius: "0.8rem",
                        fontFamily: fd,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
                        transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    Go to Bet Codes
                </button>

                <p style={{
                    fontFamily: f,
                    fontSize: "1.2rem",
                    color: "#99989f",
                    marginTop: "2rem",
                    margin: "2rem 0 0"
                }}>
                    Redirecting automatically in 3 seconds...
                </p>
            </div>
        </div>
    );
}

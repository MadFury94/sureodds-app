"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BetslipsRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Immediate redirect
        router.push("/dashboard/punter/bet-codes");
    }, [router]);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            padding: "2rem"
        }}>
            <p style={{ fontSize: "1.6rem", color: "#68676d" }}>
                Redirecting to Bet Codes...
            </p>
        </div>
    );
}

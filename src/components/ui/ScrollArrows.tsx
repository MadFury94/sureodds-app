"use client";

interface Props {
    canLeft: boolean;
    canRight: boolean;
    onLeft: () => void;
    onRight: () => void;
}

const btn: React.CSSProperties = {
    width: "3.6rem", height: "3.6rem", borderRadius: "50%",
    border: "1px solid #ddd", backgroundColor: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
};

/** Left/right arrow button pair for scrollable sections */
export default function ScrollArrows({ canLeft, canRight, onLeft, onRight }: Props) {
    return (
        <div style={{ display: "flex", gap: "0.8rem" }}>
            <button onClick={onLeft} disabled={!canLeft} style={{ ...btn, opacity: canLeft ? 1 : 0.35 }} aria-label="Previous">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                    <path d="M7 1L1 7l6 6" />
                </svg>
            </button>
            <button onClick={onRight} disabled={!canRight} style={{ ...btn, opacity: canRight ? 1 : 0.35 }} aria-label="Next">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                    <path d="M1 1l6 6-6 6" />
                </svg>
            </button>
        </div>
    );
}

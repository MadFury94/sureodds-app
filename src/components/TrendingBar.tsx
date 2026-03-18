const items = [
    "🏈 Chiefs vs Eagles Preview",
    "🏀 LeBron Passes Jordan",
    "⚽ Champions League Draw",
    "🥊 Canelo Next Fight",
    "🏒 Stanley Cup Odds",
    "⚾ MLB Opening Day Picks",
    "🏈 NFL Draft Top Prospects",
    "🏀 NBA Playoffs Picture",
];

export default function TrendingBar() {
    return (
        <div style={{ backgroundColor: "#e9173d", display: "flex", alignItems: "center", height: "3.2rem", overflow: "hidden" }}>
            <div style={{
                flexShrink: 0, backgroundColor: "#b60122",
                height: "100%", display: "flex", alignItems: "center",
                padding: "0 1.2rem",
                fontFamily: '"Proxima Nova", Arial, sans-serif',
                fontWeight: 700, fontSize: "1.1rem",
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#fff", whiteSpace: "nowrap",
            }}>
                TRENDING
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2.4rem", overflowX: "auto", padding: "0 1.6rem" }} className="scrollbar-hide">
                {items.map((item, i) => (
                    <a key={i} href="#" style={{
                        flexShrink: 0, color: "#fff",
                        fontFamily: '"Proxima Nova", Arial, sans-serif',
                        fontWeight: 600, fontSize: "1.2rem",
                        whiteSpace: "nowrap",
                    }}>
                        {item}
                    </a>
                ))}
            </div>
        </div>
    );
}

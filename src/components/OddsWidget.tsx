const games = [
    { sport: "NFL", matchup: "Eagles @ Chiefs", away: "Eagles", awayOdds: "+105", home: "Chiefs", homeOdds: "-110", time: "Sun 6:30 PM" },
    { sport: "NBA", matchup: "Celtics @ Lakers", away: "Celtics", awayOdds: "-150", home: "Lakers", homeOdds: "+130", time: "Tue 7:00 PM" },
    { sport: "MLB", matchup: "Red Sox @ Yankees", away: "Red Sox", awayOdds: "+115", home: "Yankees", homeOdds: "-125", time: "Wed 1:05 PM" },
    { sport: "Soccer", matchup: "Arsenal @ Man City", away: "Arsenal", awayOdds: "+200", home: "Man City", homeOdds: "-140", time: "Sat 12:30 PM" },
];

function OddsBtn({ label, odds }: { label: string; odds: string }) {
    const pos = odds.startsWith("+");
    return (
        <div style={{
            backgroundColor: "#3d3c41", borderRadius: "0.4rem",
            padding: "0.4rem 0.8rem", minWidth: "5.6rem", textAlign: "center",
        }}>
            <div style={{ color: "#99989f", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
            <div style={{ color: pos ? "#02cc77" : "#f2f5f6", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2 }}>{odds}</div>
        </div>
    );
}

export default function OddsWidget() {
    return (
        <div style={{ backgroundColor: "#27262a", borderRadius: "0.4rem", overflow: "hidden" }}>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "1rem 1.2rem", borderBottom: "1px solid #3d3c41",
            }}>
                <span style={{ fontWeight: 700, fontSize: "1.3rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#f2f5f6" }}>
                    Today&apos;s Odds
                </span>
                <a href="#" style={{ color: "#e9173d", fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    View All
                </a>
            </div>
            {games.map((g, i) => (
                <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.2rem", gap: "0.8rem",
                    borderBottom: i < games.length - 1 ? "1px solid #3d3c41" : "none",
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#e9173d", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase" }}>{g.sport}</div>
                        <div style={{ color: "#f2f5f6", fontSize: "1.3rem", fontWeight: 700, marginTop: "0.2rem" }}>{g.matchup}</div>
                        <div style={{ color: "#68676d", fontSize: "1.1rem", marginTop: "0.2rem" }}>{g.time}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
                        <OddsBtn label={g.away} odds={g.awayOdds} />
                        <OddsBtn label={g.home} odds={g.homeOdds} />
                    </div>
                </div>
            ))}
        </div>
    );
}

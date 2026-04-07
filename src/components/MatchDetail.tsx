import type { MatchDetails } from "@/lib/footballdata";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface MatchDetailProps {
    details: MatchDetails;
}

export default function MatchDetail({ details }: MatchDetailProps) {
    const { match, head2head } = details;
    const hasLineups = match.homeTeam.lineup && match.awayTeam.lineup;
    const hasEvents = match.goals || match.bookings || match.substitutions;

    return (
        <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "2rem 1.2rem" }}>
            {/* Match Header */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2.4rem", marginBottom: "2rem", border: "1px solid #e8ebed" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", marginBottom: "2rem" }}>
                    {/* Home Team */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={80} height={80} style={{ width: "8rem", height: "8rem", objectFit: "contain" }} />
                        <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>{match.homeTeam.name}</h2>
                    </div>

                    {/* Score */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                            <span style={{ fontFamily: fd, fontSize: "4.8rem", fontWeight: 700, color: "#1a1a1a" }}>{match.score.fullTime.home ?? "-"}</span>
                            <span style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#99989f" }}>-</span>
                            <span style={{ fontFamily: fd, fontSize: "4.8rem", fontWeight: 700, color: "#1a1a1a" }}>{match.score.fullTime.away ?? "-"}</span>
                        </div>
                        {match.score.halfTime.home !== null && (
                            <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>HT: {match.score.halfTime.home} - {match.score.halfTime.away}</span>
                        )}
                        <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: match.status === "IN_PLAY" ? "#ff6b00" : "#68676d", textTransform: "uppercase" }}>
                            {match.status === "FINISHED" ? "Full Time" : match.status === "IN_PLAY" ? "LIVE" : match.status}
                        </span>
                    </div>

                    {/* Away Team */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={80} height={80} style={{ width: "8rem", height: "8rem", objectFit: "contain" }} />
                        <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>{match.awayTeam.name}</h2>
                    </div>
                </div>

                {/* Match Info */}
                <div style={{ display: "flex", justifyContent: "center", gap: "2rem", paddingTop: "1.6rem", borderTop: "1px solid #e8ebed", flexWrap: "wrap" }}>
                    {match.venue && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99989f" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>{match.venue}</span>
                        </div>
                    )}
                    {match.referees && match.referees[0] && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>Referee:</span>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", fontWeight: 600 }}>{match.referees[0].name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Head to Head */}
            {head2head && head2head.numberOfMatches > 0 && (
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", marginBottom: "2rem", border: "1px solid #e8ebed" }}>
                    <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase" }}>Head to Head</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "2rem", alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a6b3c" }}>{head2head.homeTeam.wins}</div>
                            <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Wins</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#99989f" }}>{head2head.homeTeam.draws}</div>
                            <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Draws</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a6b3c" }}>{head2head.awayTeam.wins}</div>
                            <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Wins</div>
                        </div>
                    </div>
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Last {head2head.numberOfMatches} meetings</span>
                    </div>
                </div>
            )}

            {/* Match Events Timeline */}
            {hasEvents && match.status === "FINISHED" && (
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", marginBottom: "2rem", border: "1px solid #e8ebed" }}>
                    <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase" }}>Match Events</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        {/* Goals */}
                        {match.goals?.map((goal, i) => {
                            const isHome = goal.team.id === match.homeTeam.id;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem", justifyContent: isHome ? "flex-start" : "flex-end" }}>
                                    {isHome && (
                                        <>
                                            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "#1a6b3c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <span style={{ fontSize: "2rem" }}>⚽</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{goal.scorer.name}</div>
                                                {goal.assist && <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Assist: {goal.assist.name}</div>}
                                            </div>
                                            <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a6b3c" }}>{goal.minute}'</div>
                                        </>
                                    )}
                                    {!isHome && (
                                        <>
                                            <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a6b3c" }}>{goal.minute}'</div>
                                            <div style={{ flex: 1, textAlign: "right" }}>
                                                <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{goal.scorer.name}</div>
                                                {goal.assist && <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Assist: {goal.assist.name}</div>}
                                            </div>
                                            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "#1a6b3c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <span style={{ fontSize: "2rem" }}>⚽</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}

                        {/* Yellow/Red Cards */}
                        {match.bookings?.map((booking, i) => {
                            const isHome = booking.team.id === match.homeTeam.id;
                            const isRed = booking.card === "RED_CARD";
                            return (
                                <div key={`booking-${i}`} style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem", justifyContent: isHome ? "flex-start" : "flex-end" }}>
                                    {isHome && (
                                        <>
                                            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: isRed ? "#e91e3a" : "#ffd700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <div style={{ width: "1.6rem", height: "2.2rem", backgroundColor: isRed ? "#fff" : "#000", borderRadius: "0.2rem" }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{booking.player.name}</div>
                                                <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{isRed ? "Red Card" : "Yellow Card"}</div>
                                            </div>
                                            <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: isRed ? "#e91e3a" : "#ffd700" }}>{booking.minute}'</div>
                                        </>
                                    )}
                                    {!isHome && (
                                        <>
                                            <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: isRed ? "#e91e3a" : "#ffd700" }}>{booking.minute}'</div>
                                            <div style={{ flex: 1, textAlign: "right" }}>
                                                <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{booking.player.name}</div>
                                                <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{isRed ? "Red Card" : "Yellow Card"}</div>
                                            </div>
                                            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: isRed ? "#e91e3a" : "#ffd700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <div style={{ width: "1.6rem", height: "2.2rem", backgroundColor: isRed ? "#fff" : "#000", borderRadius: "0.2rem" }} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lineups */}
            {hasLineups && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    {/* Home Team Lineup */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                        <h3 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase" }}>
                            {match.homeTeam.shortName || match.homeTeam.name} Lineup
                        </h3>
                        {match.homeTeam.coach && (
                            <div style={{ marginBottom: "1.6rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", textTransform: "uppercase" }}>Coach</span>
                                <div style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginTop: "0.4rem" }}>{match.homeTeam.coach.name}</div>
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {match.homeTeam.lineup?.map((player) => (
                                <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem", backgroundColor: "#f9fafb", borderRadius: "0.6rem" }}>
                                    <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", backgroundColor: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                                        {player.shirtNumber}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                                        <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{player.position}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {match.homeTeam.bench && match.homeTeam.bench.length > 0 && (
                            <>
                                <h4 style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", textTransform: "uppercase" }}>Substitutes</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {match.homeTeam.bench.map((player) => (
                                        <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.6rem", backgroundColor: "#fafafa", borderRadius: "0.6rem" }}>
                                            <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "50%", backgroundColor: "#e8ebed", color: "#68676d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fd, fontSize: "1rem", fontWeight: 700, flexShrink: 0 }}>
                                                {player.shirtNumber}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 600, color: "#68676d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Away Team Lineup */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                        <h3 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase" }}>
                            {match.awayTeam.shortName || match.awayTeam.name} Lineup
                        </h3>
                        {match.awayTeam.coach && (
                            <div style={{ marginBottom: "1.6rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", textTransform: "uppercase" }}>Coach</span>
                                <div style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginTop: "0.4rem" }}>{match.awayTeam.coach.name}</div>
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {match.awayTeam.lineup?.map((player) => (
                                <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem", backgroundColor: "#f9fafb", borderRadius: "0.6rem" }}>
                                    <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", backgroundColor: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                                        {player.shirtNumber}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                                        <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{player.position}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {match.awayTeam.bench && match.awayTeam.bench.length > 0 && (
                            <>
                                <h4 style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", textTransform: "uppercase" }}>Substitutes</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {match.awayTeam.bench.map((player) => (
                                        <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.6rem", backgroundColor: "#fafafa", borderRadius: "0.6rem" }}>
                                            <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "50%", backgroundColor: "#e8ebed", color: "#68676d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fd, fontSize: "1rem", fontWeight: 700, flexShrink: 0 }}>
                                                {player.shirtNumber}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 600, color: "#68676d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

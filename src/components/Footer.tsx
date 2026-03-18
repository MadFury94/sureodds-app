"use client";

const links = {
    Sports: ["NFL", "NBA", "MLB", "NHL", "Soccer", "MMA", "Boxing", "Golf", "Tennis"],
    Betting: ["Today's Odds", "Best Picks", "Parlays", "Props", "Futures", "Live Betting"],
    Company: ["About Us", "Careers", "Advertise", "Contact", "Privacy Policy", "Terms of Use"],
};

export default function Footer() {
    return (
        <footer style={{ backgroundColor: "#000", borderTop: "1px solid #27262a", marginTop: "6.4rem" }}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <span
                            style={{
                                fontSize: "2.4rem",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "-0.03em",
                                color: "#fff",
                                fontFamily: "'Arial Black', sans-serif",
                            }}
                        >
                            SURE<span style={{ color: "#e9173d" }}>ODDS</span>
                        </span>
                        <p style={{ color: "#68676d", fontSize: "1.3rem", marginTop: "1.2rem", lineHeight: 1.6 }}>
                            Sports. Odds. News. Now.
                        </p>
                    </div>
                    {Object.entries(links).map(([section, items]) => (
                        <div key={section}>
                            <h4
                                style={{
                                    color: "#f2f5f6",
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    marginBottom: "1.6rem",
                                }}
                            >
                                {section}
                            </h4>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {items.map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            style={{ color: "#68676d", fontSize: "1.3rem", transition: "color 0.2s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f5f6")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#68676d")}
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div
                    style={{ borderTop: "1px solid #27262a", paddingTop: "2.4rem", color: "#68676d", fontSize: "1.2rem" }}
                    className="flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <p>© {new Date().getFullYear()} Sureodds. All rights reserved.</p>
                    <p>Gambling involves risk. Please bet responsibly. 18+</p>
                </div>
            </div>
        </footer>
    );
}

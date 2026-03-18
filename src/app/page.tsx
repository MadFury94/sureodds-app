import ScoresTicker from "@/components/ScoresTicker";
import ArticleCard from "@/components/ArticleCard";

const f = '"Proxima Nova", Arial, sans-serif';

const leftCards = [
  {
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    category: "NBA",
    emoji: "🏀",
    title: "Final Takeaways from WBC 🏆",
  },
  {
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    category: "Soccer",
    emoji: "⚽",
    title: "Every Team's Biggest X-Factor ❎",
  },
];

const hero = {
  image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=900&q=80",
  category: "NFL",
  emoji: "🏈",
  title: "Biggest FA Overreactions 👢👢",
};

// Right col — top headlines with sport emojis like BR
const topHeadlines = [
  { emoji: "🏈", category: "NFL", title: "Chiefs Dynasty Continues: Can Anyone Stop Kansas City?" },
  { emoji: "🏀", category: "NBA", title: "LeBron James Passes Michael Jordan on All-Time Scoring List" },
  { emoji: "⚽", category: "Soccer", title: "Champions League Quarter-Final Draw Announced" },
  { emoji: "⚾", category: "MLB", title: "Yankees Sign Star Pitcher to Record-Breaking $400M Deal" },
  { emoji: "🥊", category: "Boxing", title: "Canelo vs Benavidez: Fight Date, Odds, and Predictions" },
  { emoji: "🏒", category: "NHL", title: "Avalanche Dominate Oilers in Western Conference Showdown" },
];

const badgeColors: Record<string, string> = {
  NFL: "#e9173d", NBA: "#e9173d", MLB: "#003087", NHL: "#003087",
  Soccer: "#1a1a1a", Boxing: "#1a1a1a", MMA: "#1a1a1a", Golf: "#1a6b3c",
};

export default function Home() {
  return (
    <>
      <ScoresTicker />

      {/* Gradient background wrapping the hero */}
      <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
        <main style={{ maxWidth: "144rem", margin: "0 auto" }}>

          {/* ── Hero: left thumbs | center big | right headlines ── */}
          <section className="hero-section">

            {/* Left col — 2 stacked thumb cards */}
            <div className="hero-left">
              {leftCards.map((c, i) => (
                <ArticleCard key={i} {...c} size="thumb" />
              ))}
            </div>

            {/* Center — big hero */}
            <a href="#" className="hero-center" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                <img src={hero.image} alt={hero.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0", flexShrink: 0 }}>
                <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0, marginTop: "0.2rem" }}>{hero.emoji}</span>
                <h2 style={{ fontFamily: f, fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2, color: "#1a1a1a" }}>
                  {hero.title}
                </h2>
              </div>
            </a>

            {/* Right col — TOP HEADLINES */}
            <div className="hero-headlines">
              <p style={{
                fontFamily: '"Druk Text Wide", "Arial Black", sans-serif',
                fontWeight: 700, fontSize: "1.6rem",
                textTransform: "uppercase", letterSpacing: "0.04em",
                color: "#1a1a1a", marginBottom: "0.8rem",
              }}>
                Top Headlines
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {topHeadlines.map((h, i) => (
                  <a key={i} href="#" style={{
                    display: "flex", alignItems: "flex-start", gap: "0.8rem",
                    padding: "0.9rem 0",
                    borderBottom: i < topHeadlines.length - 1 ? "1px solid #ddd" : "none",
                    textDecoration: "none",
                  }}>
                    <span style={{ fontSize: "1.6rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}>{h.emoji}</span>
                    <span className="clamp2" style={{
                      fontFamily: f, fontSize: "1.625rem", fontWeight: 600,
                      color: "#1a1a1a", lineHeight: 1.3,
                    }}>
                      {h.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </section>

        </main>
      </div>

    </>
  );
}

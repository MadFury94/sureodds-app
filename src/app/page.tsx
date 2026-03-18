import Navbar from "@/components/Navbar";
import ScoresTicker from "@/components/ScoresTicker";
import ArticleCard from "@/components/ArticleCard";
import OddsWidget from "@/components/OddsWidget";
import Footer from "@/components/Footer";

const featured = [
  {
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=900&q=80",
    category: "NFL",
    title: "Chiefs Dynasty Continues: Can Anyone Stop Kansas City in 2025?",
    time: "2 hours ago",
  },
  {
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    category: "NBA",
    title: "LeBron James Passes Michael Jordan on All-Time Scoring List",
    time: "4 hours ago",
  },
  {
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    category: "Soccer",
    title: "Champions League Quarter-Final Draw: The Ties That Could Define the Season",
    time: "6 hours ago",
  },
];

const latest = [
  { image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80", category: "MLB", title: "Yankees Sign Star Pitcher to Record-Breaking $400M Deal", time: "1 hour ago" },
  { image: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=500&q=80", category: "NHL", title: "Avalanche Dominate Oilers in Western Conference Showdown", time: "3 hours ago" },
  { image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&q=80", category: "MMA", title: "UFC 300 Card Announced: Three Title Fights Headline Historic Event", time: "5 hours ago" },
  { image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80", category: "NFL", title: "Top 10 NFL Draft Prospects: Who Goes First Overall?", time: "7 hours ago" },
];

const sidebar = [
  { image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=200&q=80", category: "NBA", title: "Celtics vs Heat: Eastern Conference Finals Preview and Odds", time: "30 min ago" },
  { image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80", category: "Soccer", title: "Mbappe Scores Hat-Trick as Real Madrid Cruise to Victory", time: "1 hour ago" },
  { image: "https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=200&q=80", category: "Boxing", title: "Canelo vs Benavidez: Fight Date, Odds, and Predictions", time: "2 hours ago" },
  { image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&q=80", category: "Golf", title: "Masters 2025: Scheffler Leads After Round Two at Augusta", time: "3 hours ago" },
  { image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80", category: "NFL", title: "Super Bowl Futures: Early Odds and Dark Horse Contenders", time: "4 hours ago" },
];

function SectionHeader({ title, href = "#" }: { title: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #e9173d", paddingBottom: "1rem", marginBottom: "1.6rem" }}>
      <span style={{ fontFamily: '"Proxima Nova", Arial, sans-serif', fontWeight: 700, fontSize: "1.4rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#f2f5f6" }}>
        {title}
      </span>
      <a href={href} style={{ color: "#e9173d", fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        See All
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
      <Navbar />
      <ScoresTicker />

      <main style={{ maxWidth: "128rem", margin: "0 auto", padding: "1.6rem 1.6rem 0" }}>

        {/* ── Hero section: 2/3 big card + 1/3 two stacked cards ── */}
        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.4rem", marginBottom: "0.4rem", height: "46rem" }}>
          {/* Hero left */}
          <ArticleCard {...featured[0]} size="hero" />
          {/* Right stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ flex: 1 }}><ArticleCard {...featured[1]} size="hero" /></div>
            <div style={{ flex: 1 }}><ArticleCard {...featured[2]} size="hero" /></div>
          </div>
        </section>

        {/* ── Body: latest news (2/3) + sidebar (1/3) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3.2rem", paddingTop: "3.2rem" }}>

          {/* Latest news grid */}
          <div>
            <SectionHeader title="Latest News" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              {latest.map((a, i) => <ArticleCard key={i} {...a} size="medium" />)}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
            <OddsWidget />
            <div>
              <SectionHeader title="Top Stories" />
              <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {sidebar.map((a, i) => <ArticleCard key={i} {...a} size="small" />)}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

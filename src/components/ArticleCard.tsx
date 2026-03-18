interface Props {
    image: string;
    category: string;
    title: string;
    time: string;
    size?: "hero" | "medium" | "small";
}

export default function ArticleCard({ image, category, title, time, size = "medium" }: Props) {

    /* ── Small: horizontal thumb + text (sidebar list) ── */
    if (size === "small") {
        return (
            <a href="#" style={{ display: "flex", gap: "1.2rem", paddingBottom: "1.6rem", borderBottom: "1px solid #27262a" }}>
                <div style={{ flexShrink: 0, width: "9.6rem", height: "6.4rem", overflow: "hidden", borderRadius: "0.4rem" }}>
                    <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
                    <span style={{ color: "#e9173d", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {category}
                    </span>
                    <p className="clamp2" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.3, color: "#f2f5f6" }}>
                        {title}
                    </p>
                    <span style={{ color: "#68676d", fontSize: "1.1rem" }}>{time}</span>
                </div>
            </a>
        );
    }

    /* ── Hero: image fills left 2/3, text overlaid bottom ── */
    if (size === "hero") {
        return (
            <a href="#" style={{ display: "block", position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "0.4rem" }}>
                <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {/* gradient overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2.4rem" }}>
                    <span style={{ color: "#e9173d", fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {category}
                    </span>
                    <h2 className="clamp3" style={{
                        fontFamily: '"Druk Text Wide", "Arial Black", sans-serif',
                        fontWeight: 700, fontSize: "2.4rem", lineHeight: 1.1,
                        textTransform: "uppercase", color: "#fff", marginTop: "0.4rem",
                    }}>
                        {title}
                    </h2>
                    <span style={{ color: "#99989f", fontSize: "1.2rem", marginTop: "0.8rem", display: "block" }}>{time}</span>
                </div>
            </a>
        );
    }

    /* ── Medium: stacked card ── */
    return (
        <a href="#" style={{ display: "block", backgroundColor: "#27262a", borderRadius: "0.4rem", overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "1.2rem" }}>
                <span style={{ color: "#e9173d", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {category}
                </span>
                <h3 className="clamp2" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, color: "#f2f5f6", marginTop: "0.4rem" }}>
                    {title}
                </h3>
                <span style={{ color: "#68676d", fontSize: "1.1rem", marginTop: "0.6rem", display: "block" }}>{time}</span>
            </div>
        </a>
    );
}

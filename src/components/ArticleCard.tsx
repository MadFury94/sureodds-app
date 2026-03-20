const f = '"Proxima Nova", Arial, sans-serif';

function SportBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        NFL: "#ff6b00", NBA: "#ff6b00", MLB: "#003087", NHL: "#003087",
        Soccer: "#1a1a1a", Boxing: "#1a1a1a", MMA: "#1a1a1a", Golf: "#1a6b3c",
    };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "1.8rem", height: "1.8rem", borderRadius: "0.2rem",
            backgroundColor: colors[category] ?? "#68676d", flexShrink: 0,
        }}>
            <span style={{ fontFamily: f, fontSize: "0.8rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {category.slice(0, 2).toUpperCase()}
            </span>
        </span>
    );
}

interface Props {
    image: string;
    category: string;
    title: string;
    time?: string;
    emoji?: string;
    size?: "hero" | "thumb" | "medium" | "small";
}

export default function ArticleCard({ image, category, title, time, emoji, size = "medium" }: Props) {
    if (size === "thumb") {
        return (
            <a href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                <div style={{ width: "100%", aspectRatio: "4/2.295", overflow: "hidden", borderRadius: "0.8rem" }}>
                    <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                    {emoji
                        ? <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}>{emoji}</span>
                        : <SportBadge category={category} />
                    }
                    <p className="clamp2" style={{ fontFamily: f, fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a" }}>
                        {title}
                    </p>
                </div>
            </a>
        );
    }

    if (size === "hero") {
        return (
            <a href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none", height: "100%" }}>
                <div style={{ width: "100%", flex: 1, overflow: "hidden", minHeight: 0, borderRadius: "0.8rem" }}>
                    <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0", flexShrink: 0 }}>
                    <SportBadge category={category} />
                    <h2 style={{ fontFamily: f, fontWeight: 700, fontSize: "1.8rem", lineHeight: 1.2, color: "#1a1a1a" }}>
                        {title}
                    </h2>
                </div>
            </a>
        );
    }

    if (size === "small") {
        return (
            <a href="#" style={{ display: "flex", gap: "1.2rem", paddingBottom: "1.6rem", borderBottom: "1px solid #e5e5e5", textDecoration: "none" }}>
                <div style={{ flexShrink: 0, width: "9.6rem", height: "6.4rem", overflow: "hidden" }}>
                    <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
                    <span style={{ fontFamily: f, color: "#ff6b00", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{category}</span>
                    <p className="clamp2" style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.3, color: "#1a1a1a" }}>{title}</p>
                    <span style={{ fontFamily: f, color: "#68676d", fontSize: "1.1rem" }}>{time}</span>
                </div>
            </a>
        );
    }

    return (
        <a href="#" style={{ display: "block", backgroundColor: "#fff", overflow: "hidden", textDecoration: "none" }}>
            <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "1.2rem" }}>
                <span style={{ fontFamily: f, color: "#ff6b00", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{category}</span>
                <h3 className="clamp2" style={{ fontFamily: f, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a", marginTop: "0.4rem" }}>{title}</h3>
                <span style={{ fontFamily: f, color: "#68676d", fontSize: "1.1rem", marginTop: "0.6rem", display: "block" }}>{time}</span>
            </div>
        </a>
    );
}

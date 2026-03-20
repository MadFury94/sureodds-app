import { colors, fonts, LEAGUE_LOGOS, CATEGORY_COLORS } from "@/lib/config";

interface Props {
    category: string;
    color?: string;
    size?: "sm" | "md";
}

/**
 * Shows the league logo if one is mapped, otherwise a coloured text abbreviation box.
 * Local SVG logos (e.g. AFCON) get a coloured background so they're visible on light backgrounds.
 */
export default function CategoryBadge({ category, color, size = "md" }: Props) {
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    const logo = LEAGUE_LOGOS[slug];
    const dim = size === "sm" ? "1.8rem" : "2.2rem";
    const fontSize = size === "sm" ? "0.8rem" : "0.9rem";
    const bg = color ?? CATEGORY_COLORS[slug] ?? colors.gray500;

    if (logo) {
        // Local SVGs (like AFCON) need a coloured background to be visible
        const isLocal = logo.startsWith("/");
        return (
            <div style={{
                width: dim, height: dim, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...(isLocal && {
                    backgroundColor: bg,
                    borderRadius: "0.2rem",
                    padding: "0.2rem",
                }),
            }}>
                <img src={logo} alt={category} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
        );
    }

    return (
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: dim, height: dim, borderRadius: "0.2rem",
            backgroundColor: bg, flexShrink: 0,
        }}>
            <span style={{ fontFamily: fonts.body, fontSize, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {category.slice(0, 2).toUpperCase()}
            </span>
        </span>
    );
}

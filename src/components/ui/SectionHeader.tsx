import { colors, fonts } from "@/lib/config";

interface Props {
    title: string;
    href?: string;
    hrefLabel?: string;
    badge?: string;
    badgeColor?: string;
    children?: React.ReactNode; // right-side slot (e.g. arrow buttons)
}

/** Consistent section title row used in LatestSection, MostRead, SportSection, etc. */
export default function SectionHeader({ title, href, hrefLabel = "View All →", badge, badgeColor, children }: Props) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{
                    fontFamily: fonts.display, fontWeight: 700, fontSize: "1.6rem",
                    color: colors.gray800, textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                    {title}
                </span>
                {badge && (
                    <span style={{
                        display: "inline-flex", padding: "0.3rem 0.8rem", borderRadius: "0.2rem",
                        backgroundColor: badgeColor ?? colors.primary,
                        fontFamily: fonts.body, fontSize: "1rem", fontWeight: 700,
                        color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                        {badge}
                    </span>
                )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                {href && (
                    <a href={href} style={{
                        fontFamily: fonts.body, fontSize: "1.3rem", fontWeight: 600,
                        color: colors.primary, textDecoration: "none",
                    }}>
                        {hrefLabel}
                    </a>
                )}
                {children}
            </div>
        </div>
    );
}

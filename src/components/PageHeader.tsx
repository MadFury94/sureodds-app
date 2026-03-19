const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface Props {
    title: string;
    subtitle?: string;
    image?: string;
    badge?: string;
    badgeColor?: string;
    logo?: string;          // league/competition logo URL
    logoAlt?: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80";

export default function PageHeader({ title, subtitle, image, badge, badgeColor = "#e9173d", logo, logoAlt }: Props) {
    const bg = image ?? DEFAULT_IMAGE;

    return (
        <div style={{
            position: "relative", width: "100%",
            height: "70vh", minHeight: "39.2rem", maxHeight: "63rem",
            overflow: "hidden",
        }} className="article-hero-wrap">

            {/* Background image */}
            <img
                src={bg}
                alt={title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />

            {/* Heavy gradient overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.88) 75%, rgba(0,0,0,0.97) 100%)",
            }} />

            {/* Content pinned to bottom */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "0 1.2rem 5.6rem",
            }} className="page-header-content">
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", display: "flex", alignItems: "flex-end", gap: "2.8rem" }} className="page-header-inner">

                    {/* League logo — large, left of text */}
                    {logo && (
                        <div className="page-header-logo" style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "1.2rem",
                            border: "1px solid rgba(255,255,255,0.15)",
                            padding: "1.2rem",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            marginBottom: "0.4rem",
                        }}>
                            <img
                                src={logo}
                                alt={logoAlt ?? title}
                                style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
                            />
                        </div>
                    )}

                    {/* Text block */}
                    <div style={{ flex: 1 }}>
                        {badge && (
                            <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                padding: "0.4rem 1.2rem", borderRadius: "0.2rem",
                                backgroundColor: badgeColor,
                                fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff",
                                textTransform: "uppercase", letterSpacing: "0.1em",
                                marginBottom: "1.4rem",
                            }}>
                                {badge}
                            </span>
                        )}
                        <h1 style={{
                            fontFamily: fd, fontWeight: 700,
                            fontSize: "clamp(3.2rem, 5vw, 6.4rem)",
                            lineHeight: 1.08, color: "#fff",
                            maxWidth: "80rem", marginBottom: subtitle ? "1.2rem" : 0,
                            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                        }}>
                            {title}
                        </h1>
                        {subtitle && (
                            <p style={{
                                fontFamily: f, fontSize: "clamp(1.5rem, 2vw, 1.9rem)",
                                color: "rgba(255,255,255,0.75)", maxWidth: "64rem", lineHeight: 1.55,
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

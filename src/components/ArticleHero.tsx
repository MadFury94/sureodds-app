"use client";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface Props {
    image: string;
    title: string;
    category: string;
    categoryColor: string;
    author: string;
    authorInitials: string;
    date: string;
}

export default function ArticleHero({ image, title, category, categoryColor, author, authorInitials, date }: Props) {
    function scrollToContent() {
        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "70vh", minHeight: "39.2rem", maxHeight: "63rem", overflow: "hidden" }} className="article-hero-wrap">

            {/* Background image */}
            <img
                src={image}
                alt={title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />

            {/* Heavy gradient overlay — dark at bottom, semi-dark at top */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.92) 80%, rgba(0,0,0,0.98) 100%)",
            }} />

            {/* Content — pinned to bottom */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "0 1.2rem 7.2rem",
            }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto" }}>

                    {/* Category badge */}
                    <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        padding: "0.4rem 1.2rem", borderRadius: "0.2rem",
                        backgroundColor: categoryColor,
                        fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        marginBottom: "1.6rem",
                    }}>
                        {category}
                    </span>

                    {/* Title */}
                    <h1 style={{
                        fontFamily: fd, fontWeight: 700,
                        fontSize: "clamp(2.2rem, 4vw, 5.6rem)",
                        lineHeight: 1.08, color: "#fff",
                        maxWidth: "88rem", marginBottom: "2rem",
                        textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                    }}>
                        {title}
                    </h1>

                    {/* Author + date */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                            <div style={{
                                width: "3.6rem", height: "3.6rem", borderRadius: "50%",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                border: "1.5px solid rgba(255,255,255,0.4)",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <span style={{ fontFamily: fd, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{authorInitials}</span>
                            </div>
                            <span style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{author}</span>
                        </div>
                        <span style={{ fontFamily: f, fontSize: "1.4rem", color: "rgba(255,255,255,0.65)" }}>{date}</span>
                    </div>
                </div>
            </div>

            {/* Blinking scroll arrow */}
            <button
                onClick={scrollToContent}
                aria-label="Scroll to article"
                style={{
                    position: "absolute", bottom: "2.4rem", left: "50%", transform: "translateX(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: "0.8rem",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
                    animation: "arrowBlink 1.4s ease-in-out infinite",
                }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                </svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            <style>{`
                @keyframes arrowBlink {
                    0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    50% { opacity: 0.4; transform: translateX(-50%) translateY(6px); }
                }
            `}</style>
        </div>
    );
}

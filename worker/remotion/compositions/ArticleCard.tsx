/**
 * ArticleCard — 1080×1920 vertical video for YouTube Shorts, TikTok, Reels
 *
 * Structure (20 seconds @ 30fps = 600 frames):
 *   0–30    Fade in — background + category badge
 *   30–90   Featured image slides up from bottom
 *   90–180  Title animates in word by word
 *   180–480 Excerpt scrolls — holds on screen
 *   480–540 Logo + CTA fade in ("Read more at sureodds.ng")
 *   540–600 Fade to black
 *
 * Props match VideoJobInput from src/lib/video-queue.ts
 */

import {
    AbsoluteFill,
    Img,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    staticFile,
    Sequence,
} from "remotion";

interface Props {
    title: string;
    image: string;   // absolute URL
    category: string;
    excerpt: string;
    date: string;   // ISO string
}

// ── Helpers ───────────────────────────────────────────────────────────────

const BRAND_ORANGE = "#ff6b00";
const BRAND_BLACK = "#0a0a0a";
const FONT_DISPLAY = '"Arial Black", sans-serif';
const FONT_BODY = "Arial, sans-serif";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

// ── Composition ───────────────────────────────────────────────────────────

export const ArticleCard: React.FC<Props> = ({ title, image, category, excerpt, date }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // ── Phase timings (frames) ──
    const IMAGE_START = 30;
    const TITLE_START = 90;
    const EXCERPT_START = 180;
    const CTA_START = 480;
    const FADE_START = 540;

    // ── Background fade in ──
    const bgOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

    // ── Image slide up ──
    const imageProgress = spring({ frame: frame - IMAGE_START, fps, config: { damping: 18, stiffness: 80 } });
    const imageY = interpolate(imageProgress, [0, 1], [120, 0]);
    const imageOpacity = interpolate(frame, [IMAGE_START, IMAGE_START + 20], [0, 1], { extrapolateRight: "clamp" });

    // ── Category badge pop ──
    const badgeScale = spring({ frame: frame - IMAGE_START + 10, fps, config: { damping: 14, stiffness: 120 } });

    // ── Title words animate in ──
    const words = title.split(" ");
    const wordDelay = 8; // frames between each word
    const titleWords = words.map((word, i) => {
        const wordFrame = frame - TITLE_START - i * wordDelay;
        const opacity = interpolate(wordFrame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = interpolate(wordFrame, [0, 12], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return { word, opacity, y };
    });

    // ── Excerpt fade in ──
    const excerptOpacity = interpolate(frame, [EXCERPT_START, EXCERPT_START + 30], [0, 1], { extrapolateRight: "clamp" });

    // ── CTA fade in ──
    const ctaOpacity = interpolate(frame, [CTA_START, CTA_START + 30], [0, 1], { extrapolateRight: "clamp" });

    // ── Final fade to black ──
    const finalFade = interpolate(frame, [FADE_START, FADE_START + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // ── Truncate excerpt ──
    const shortExcerpt = excerpt.length > 180 ? excerpt.slice(0, 177) + "…" : excerpt;

    return (
        <AbsoluteFill style={{ backgroundColor: BRAND_BLACK, fontFamily: FONT_BODY }}>

            {/* ── Background gradient ── */}
            <AbsoluteFill
                style={{
                    opacity: bgOpacity,
                    background: `linear-gradient(170deg, #0f0f0f 0%, #1a1a1a 40%, #0a0a0a 100%)`,
                }}
            />

            {/* ── Featured image ── */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 680,
                overflow: "hidden",
                opacity: imageOpacity,
                transform: `translateY(${imageY}px)`,
            }}>
                <Img
                    src={image}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* Gradient overlay so text is readable over image */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 80%, #0a0a0a 100%)",
                }} />
            </div>

            {/* ── Category badge ── */}
            <div style={{
                position: "absolute",
                top: 60, left: 60,
                transform: `scale(${badgeScale})`,
                transformOrigin: "left center",
            }}>
                <div style={{
                    backgroundColor: BRAND_ORANGE,
                    borderRadius: 8,
                    padding: "12px 28px",
                }}>
                    <span style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 36,
                        fontWeight: 900,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                    }}>
                        {category}
                    </span>
                </div>
            </div>

            {/* ── Sureodds wordmark top right ── */}
            <div style={{
                position: "absolute", top: 60, right: 60,
                opacity: bgOpacity,
            }}>
                <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#fff",
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}>
                    SUREODDS
                </span>
            </div>

            {/* ── Title ── */}
            <div style={{
                position: "absolute",
                top: 660,
                left: 60, right: 60,
            }}>
                <div style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: clamp(title.length > 60 ? 56 : 68, 48, 76),
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                }}>
                    {titleWords.map(({ word, opacity, y }, i) => (
                        <span
                            key={i}
                            style={{
                                display: "inline-block",
                                opacity,
                                transform: `translateY(${y}px)`,
                                marginRight: "0.25em",
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Divider ── */}
            <div style={{
                position: "absolute",
                top: 980,
                left: 60, right: 60,
                height: 3,
                backgroundColor: BRAND_ORANGE,
                opacity: excerptOpacity,
            }} />

            {/* ── Excerpt ── */}
            <div style={{
                position: "absolute",
                top: 1010, left: 60, right: 60,
                opacity: excerptOpacity,
            }}>
                <p style={{
                    fontFamily: FONT_BODY,
                    fontSize: 42,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.55,
                    margin: 0,
                }}>
                    {shortExcerpt}
                </p>
            </div>

            {/* ── Date ── */}
            <div style={{
                position: "absolute",
                top: 1580, left: 60,
                opacity: excerptOpacity,
            }}>
                <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 34,
                    color: "rgba(255,255,255,0.5)",
                }}>
                    {formatDate(date)}
                </span>
            </div>

            {/* ── CTA ── */}
            <div style={{
                position: "absolute",
                bottom: 120,
                left: 60, right: 60,
                opacity: ctaOpacity,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <div>
                    <p style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 34,
                        color: BRAND_ORANGE,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        margin: 0,
                    }}>
                        Read the full story
                    </p>
                    <p style={{
                        fontFamily: FONT_BODY,
                        fontSize: 30,
                        color: "rgba(255,255,255,0.6)",
                        margin: "8px 0 0",
                    }}>
                        sureodds.ng
                    </p>
                </div>
                {/* Orange arrow */}
                <div style={{
                    width: 80, height: 80,
                    borderRadius: "50%",
                    backgroundColor: BRAND_ORANGE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* ── Final fade to black overlay ── */}
            <AbsoluteFill style={{ backgroundColor: "#000", opacity: finalFade, pointerEvents: "none" }} />

        </AbsoluteFill>
    );
};

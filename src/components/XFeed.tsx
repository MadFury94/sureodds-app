"use client";
import { useRef, useState } from "react";
import { fonts, colors } from "@/lib/config";

interface XFeedProps {
    /** Pass either a listId OR a username — listId takes priority */
    listId?: string;
    username?: string;
    title?: string;
    height?: number;
}

export default function XFeed({
    listId,
    username = "BleacherReport",
    title = "Latest on X",
    height = 520,
}: XFeedProps) {
    const [loaded, setLoaded] = useState(false);

    const src = listId
        ? `https://syndication.twitter.com/srv/timeline-list/list-id/${listId}?dnt=false&theme=light&lang=en&widgetsVersion=2615f7e52b7e0%3A1702314776716`
        : `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}?dnt=false&theme=light&lang=en&widgetsVersion=2615f7e52b7e0%3A1702314776716`;

    const followHref = listId
        ? `https://twitter.com/i/lists/${listId}`
        : `https://twitter.com/${username}`;

    const followLabel = listId ? "View List on X" : `Follow @${username}`;

    return (
        <section style={{ backgroundColor: colors.gray50, padding: "4rem 0" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.4rem" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={colors.gray800}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <h2 style={{
                        fontFamily: fonts.display, fontWeight: 700, fontSize: "1.8rem",
                        color: colors.gray800, textTransform: "uppercase", letterSpacing: "0.06em",
                        margin: 0,
                    }}>
                        {title}
                    </h2>
                </div>

                <div style={{
                    maxWidth: "60rem", margin: "0 auto",
                    borderRadius: "1.2rem", overflow: "hidden",
                    minHeight: `${height}px`, position: "relative",
                    background: "#ffffff",
                }}>
                    {!loaded && (
                        <div style={{
                            position: "absolute", inset: 0, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            background: "#f7f9f9",
                        }}>
                            <span style={{ color: "#536471", fontFamily: fonts.body, fontSize: "1.4rem" }}>
                                Loading feed…
                            </span>
                        </div>
                    )}
                    <iframe
                        src={src}
                        width="100%"
                        height={height}
                        frameBorder="0"
                        scrolling="yes"
                        title={title}
                        onLoad={() => setLoaded(true)}
                        style={{
                            display: "block", border: "none", borderRadius: "1.2rem",
                            opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease",
                        }}
                    />
                </div>

                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <a
                        href={followHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.8rem",
                            background: colors.gray800, color: colors.white,
                            fontFamily: fonts.body, fontWeight: 600, fontSize: "1.4rem",
                            padding: "1rem 2rem", borderRadius: "10rem", textDecoration: "none",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        {followLabel}
                    </a>
                </div>

            </div>
        </section>
    );
}

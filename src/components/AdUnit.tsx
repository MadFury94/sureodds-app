"use client";
import { useEffect, useRef } from "react";

type AdFormat = "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";

interface AdUnitProps {
    slot: string;
    format?: AdFormat;
    style?: React.CSSProperties;
    className?: string;
    label?: boolean;
    // Optional layout for fluid ads
    layout?: string;
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

export default function AdUnit({
    slot,
    format = "auto",
    style,
    className,
    label = true,
    layout,
}: AdUnitProps) {
    const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
    const pushed = useRef(false);
    const insRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        // Don't push if no pub ID, already pushed, or slot is placeholder
        if (!pubId || pushed.current || slot === "0000000000") return;
        // Don't push if the ins element has already been filled by AdSense
        if (insRef.current?.getAttribute("data-adsbygoogle-status")) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch { /* AdSense not loaded yet */ }
    }, [pubId, slot]);

    // Render nothing if no pub ID or placeholder slot
    if (!pubId || slot === "0000000000") return null;

    return (
        <div
            className={className}
            style={{ textAlign: "center", overflow: "hidden", minHeight: "1px", ...style }}
            aria-label="Advertisement"
        >
            {label && (
                <p style={{
                    fontSize: "1rem",
                    color: "#99989f",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 0.4rem",
                    fontFamily: "Arial, sans-serif",
                }}>
                    Advertisement
                </p>
            )}
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={pubId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
                {...(layout ? { "data-ad-layout": layout } : {})}
            />
        </div>
    );
}

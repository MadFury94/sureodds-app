"use client";
import { useEffect, useRef } from "react";

type AdFormat = "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";

interface AdUnitProps {
    slot: string;
    format?: AdFormat;
    style?: React.CSSProperties;
    className?: string;
    label?: boolean;
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

export default function AdUnit({ slot, format = "auto", style, className, label = true }: AdUnitProps) {
    const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
    const pushed = useRef(false);

    useEffect(() => {
        if (!pubId || pushed.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch { /* not loaded */ }
    }, [pubId]);

    // Render nothing if no pub ID configured
    if (!pubId) return null;

    return (
        <div className={className} style={{ textAlign: "center", overflow: "hidden", ...style }}>
            {label && (
                <p style={{
                    fontSize: "1rem", color: "#99989f", textTransform: "uppercase",
                    letterSpacing: "0.1em", margin: "0 0 0.4rem", fontFamily: "sans-serif",
                }}>
                    Advertisement
                </p>
            )}
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={pubId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}

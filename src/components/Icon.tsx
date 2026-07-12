/**
 * Lightweight SVG icon set — replaces emoji in public-facing pages.
 * All icons are 24×24 viewBox, filled or stroked with currentColor.
 */

type IconName =
    | "article"      // sponsored articles
    | "display"      // display advertising
    | "newsletter"   // email/newsletter
    | "social"       // social media
    | "target"       // category takeovers / targeting
    | "handshake"    // custom partnerships
    | "chart"        // analytics / stats
    | "money"        // earn / revenue
    | "badge"        // expert badge
    | "support"      // editorial support
    | "audience"     // build audience
    | "check"        // verified / check
    | "ban"          // no / prohibited
    | "megaphone"    // announce / spam
    | "shield"       // privacy / safety
    | "lock"         // lock / private
    | "scale"        // law / terms
    | "football"     // football / sport
    | "respect"      // respect / handshake
    | "careers-grow" // growth / careers
    | "data"         // data-driven
    | "fast"         // move fast
    | "globe"        // global / africa
    | "steps"        // how it works
    | "question";    // FAQ

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: React.CSSProperties;
}

const paths: Record<IconName, React.ReactNode> = {
    article: <><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    display: <><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    newsletter: <><rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /><polyline points="22,4 12,13 2,4" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    social: <><circle cx="18" cy="5" r="3" strokeWidth="2" stroke="currentColor" fill="none" /><circle cx="6" cy="12" r="3" strokeWidth="2" stroke="currentColor" fill="none" /><circle cx="18" cy="19" r="3" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="2" /></>,
    target: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /><circle cx="12" cy="12" r="6" strokeWidth="2" stroke="currentColor" fill="none" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>,
    handshake: <><path d="M14 9l-2-2H8L6 9H3l-1 6h2l1 2h12l1-2h2l-1-6h-3z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /><path d="M9 9v2m6-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    chart: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
    money: <><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    badge: <><circle cx="12" cy="8" r="6" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /></>,
    support: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    audience: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" /><polyline points="23 21 23 19 19 19 19 21" stroke="currentColor" strokeWidth="2" fill="none" /><polyline points="21 15 21 13 19 13" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    check: <><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
    ban: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" /></>,
    megaphone: <><path d="M3 11l19-9v18L3 13v-2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    scale: <><path d="M12 22V12M3 7l9-5 9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 10l-3 6h6l-3-6zM18 10l-3 6h6l-3-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" /><line x1="3" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    football: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M12 2C6.5 6 6 10 6 12s.5 6 6 10c5.5-4 6-8 6-10s-.5-6-6-10z" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" /></>,
    respect: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /></>,
    "careers-grow": <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
    data: <><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    fast: <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" /></>,
    globe: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    steps: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none" /><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" fill="none" /><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    question: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></>,
};

export default function Icon({ name, size = 24, color = "currentColor", style }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ display: "inline-block", flexShrink: 0, color, ...style }}
        >
            {paths[name]}
        </svg>
    );
}

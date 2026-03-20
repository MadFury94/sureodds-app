import { MAX_WIDTH } from "@/lib/config";

interface Props {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    as?: keyof React.JSX.IntrinsicElements;
}

/** Full-width wrapper constrained to the site max-width with horizontal padding */
export default function Container({ children, className, style, as: Tag = "div" }: Props) {
    return (
        <Tag
            className={className}
            style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: "0 1.2rem", ...style }}
        >
            {children}
        </Tag>
    );
}

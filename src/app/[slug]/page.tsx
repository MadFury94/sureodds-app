/**
 * Root-level slug catch-all.
 *
 * WordPress (and older versions of this site) published articles at the root:
 *   https://sureodds.ng/luka-modrics-season-ends-following-...
 *
 * The current site uses /article/[slug]. This page performs a permanent 301
 * redirect so that Google recrawls and updates its index, and any inbound
 * links continue to work.
 *
 * NOTE: This only runs when no other top-level route matches the segment.
 * All known routes (/about, /betting, /category, etc.) take priority.
 */
import { permanentRedirect } from "next/navigation";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function LegacySlugRedirect({ params }: Props) {
    const { slug } = await params;
    // 308 Permanent Redirect — SEO-safe, preserves link equity
    permanentRedirect(`/article/${slug}`);
}

// Tell Next.js this is dynamic (don't attempt static generation for every slug)
export const dynamic = "force-dynamic";

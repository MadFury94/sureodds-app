import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_WP_API ?? "https://sureodds.ng/wp-json/wp/v2";

// Keyword map: slug → keywords to match in title+excerpt (lowercase)
const KEYWORD_MAP: Record<string, string[]> = {
    transfer: ["transfer", "signs", "signed", "joins", "joined", "fee", "deal", "move", "loan", "bid", "swap"],
    "breaking-news": ["breaking", "confirmed", "official", "sacked", "appointed", "announces"],
    epl: ["premier league", "epl", "arsenal", "chelsea", "liverpool", "man city", "manchester city", "man united", "manchester united", "tottenham", "newcastle", "aston villa", "west ham", "brighton", "brentford", "fulham", "everton"],
    "la-liga": ["la liga", "laliga", "real madrid", "barcelona", "atletico madrid", "atletico", "sevilla", "valencia", "villarreal", "real sociedad", "athletic bilbao"],
    ucl: ["champions league", "ucl", "europa league", "uefa", "cl final", "knockout"],
    afcon: ["afcon", "africa cup", "caf", "super eagles", "black stars", "bafana", "harambee stars", "indomitable lions", "teranga lions"],
    "international-football": ["world cup", "nations league", "international", "qualifier", "friendly", "national team", "fifa"],
    "serie-a": ["serie a", "juventus", "inter milan", "ac milan", "napoli", "roma", "lazio", "atalanta", "fiorentina", "torino"],
};

function matchCategories(text: string): string[] {
    const lower = text.toLowerCase();
    return Object.entries(KEYWORD_MAP)
        .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
        .map(([slug]) => slug);
}

function getSession(req: NextRequest) {
    const raw = req.cookies.get("so_admin_session")?.value;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export async function POST(req: NextRequest) {
    const session = getSession(req);
    if (!session?.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postIds }: { postIds: number[] } = await req.json();
    if (!Array.isArray(postIds) || postIds.length === 0) {
        return NextResponse.json({ error: "postIds array required" }, { status: 400 });
    }

    // Fetch all WP categories once → build slug→id map
    const catsRes = await fetch(`${WP_API}/categories?per_page=100`, { cache: "no-store" });
    if (!catsRes.ok) return NextResponse.json({ error: "Failed to fetch categories" }, { status: 502 });
    const allCats: { id: number; slug: string; name: string }[] = await catsRes.json();
    const slugToId = Object.fromEntries(allCats.map(c => [c.slug, c.id]));
    const newsId = slugToId["news"];

    const results: { id: number; title: string; added: string[]; skipped: boolean }[] = [];
    let updated = 0;
    let skipped = 0;

    for (const postId of postIds) {
        try {
            const postRes = await fetch(`${WP_API}/posts/${postId}?_embed=1`, {
                headers: { Authorization: `Bearer ${session.token}` },
                cache: "no-store",
            });
            if (!postRes.ok) { skipped++; continue; }
            const post = await postRes.json();

            const currentCatIds: number[] = post.categories ?? [];
            const title: string = post.title?.rendered ?? "";
            const excerpt: string = post.excerpt?.rendered ?? "";

            // Only act if post is solely in "news" (or uncategorized)
            const hasSpecificCat = currentCatIds.some(id => id !== newsId && id !== 1);
            if (hasSpecificCat) {
                results.push({ id: postId, title, added: [], skipped: true });
                skipped++;
                continue;
            }

            const matched = matchCategories(title + " " + excerpt);
            if (matched.length === 0) {
                results.push({ id: postId, title, added: [], skipped: true });
                skipped++;
                continue;
            }

            const addIds = matched
                .map(slug => slugToId[slug])
                .filter((id): id is number => !!id && !currentCatIds.includes(id));

            if (addIds.length === 0) {
                results.push({ id: postId, title, added: [], skipped: true });
                skipped++;
                continue;
            }

            const newCatIds = [...new Set([...currentCatIds, ...addIds])];

            const patchRes = await fetch(`${WP_API}/posts/${postId}`, {
                method: "POST", // WP REST uses POST for updates too
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.token}`,
                },
                body: JSON.stringify({ categories: newCatIds }),
            });

            if (patchRes.ok) {
                results.push({ id: postId, title, added: matched, skipped: false });
                updated++;
            } else {
                skipped++;
            }
        } catch {
            skipped++;
        }
    }

    return NextResponse.json({ updated, skipped, results });
}

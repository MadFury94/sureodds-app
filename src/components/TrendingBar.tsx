import { getPosts, getFeaturedImage, formatDate, decodeTitle } from "@/lib/wordpress";
import TrendingBarScroll from "./TrendingBarScroll";

async function getLatestHeadlines() {
    try {
        const posts = await getPosts({ perPage: 12 });
        return posts.map(p => ({
            title: decodeTitle(p.title.rendered),
            slug: p.slug,
            image: getFeaturedImage(p),
            date: formatDate(p.date),
        }));
    } catch {
        return [];
    }
}

export default async function TrendingBar() {
    const items = await getLatestHeadlines();
    if (items.length === 0) return null;
    return <TrendingBarScroll items={items} />;
}

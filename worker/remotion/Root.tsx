/**
 * Remotion Root — registers all compositions.
 * This file is the entry point for `npx remotion studio` and `renderMedia()`.
 */

import { Composition } from "remotion";
import { ArticleCard } from "./compositions/ArticleCard";

// Default props used in Remotion Studio preview
const PREVIEW_PROPS = {
    title: "Newcastle United Secure Next Moisés Caicedo in Johan Martínez Deal",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1080&q=80",
    category: "Transfer News",
    excerpt: "Newcastle United have confirmed the signing of Colombian midfielder Johan Martínez from Genoa in a deal worth €28 million, with the player set to join ahead of the new season.",
    date: new Date().toISOString(),
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ArticleCard"
                component={ArticleCard}
                durationInFrames={600}   // 20 seconds @ 30fps
                fps={30}
                width={1080}
                height={1920}
                defaultProps={PREVIEW_PROPS}
            />
        </>
    );
};

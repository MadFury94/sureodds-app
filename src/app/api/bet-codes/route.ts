import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth-wordpress";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API || "https://sureodds.ng/wp-json/wp/v2";

interface BetCode {
    id: string;
    bookmaker: string;
    code: string;
    link?: string;
    image?: string;
    description: string;
    odds: string;
    stake?: string;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "won" | "lost";
    createdBy: string; // User ID
    createdByEmail?: string; // User email
    category: "free" | "sure-banker" | "premium" | "vip"; // Access level
    confidence?: string; // High, Medium, Low, Banker
}

// Convert WordPress post to BetCode format
function wpPostToBetCode(post: any): BetCode {
    return {
        id: post.id.toString(),
        bookmaker: post.meta?.bookmaker || "",
        code: post.meta?.code || "",
        link: post.meta?.link || "",
        image: post.meta?.image || "",
        description: post.title?.rendered || post.content?.rendered || "",
        odds: post.meta?.odds || "",
        stake: post.meta?.stake || "",
        expiresAt: post.meta?.expires_at || "",
        createdAt: post.date || new Date().toISOString(),
        status: post.meta?.status || "active",
        createdBy: post.author?.toString() || "",
        createdByEmail: post.meta?.created_by_email || "",
        category: post.meta?.category || "free",
        confidence: post.meta?.confidence || "Medium",
    };
}

async function getUserFromSession(req: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
    // Check user session (for punters)
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload) {
            return {
                id: payload.email, // Use email as ID for now
                email: payload.email,
                role: payload.role || "punter",
            };
        }
    }

    // Check admin session
    const adminSession = req.cookies.get("so_admin_session")?.value;
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            if (session?.token) {
                return {
                    id: "admin",
                    email: "admin",
                    role: "admin",
                };
            }
        } catch { }
    }

    return null;
}

export async function GET(req: NextRequest) {
    try {
        // Fetch bet codes from WordPress
        const response = await fetch(`${WP_API_URL}/bet-codes?per_page=100&_embed`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`);
        }

        const posts = await response.json();
        const betCodes = posts.map(wpPostToBetCode);

        // Check if request is from authenticated user
        const user = await getUserFromSession(req);

        // Filter based on user subscription level
        let filteredCodes = betCodes;

        if (!user) {
            // Not logged in - only show free codes
            filteredCodes = betCodes.filter(bc => bc.category === "free");
        } else if (user.role === "admin") {
            // Admin sees everything
            filteredCodes = betCodes;
        } else {
            // Regular user - check subscription level
            // For now, show free + sure-banker for all logged-in users
            // TODO: Implement proper subscription checking
            filteredCodes = betCodes.filter(bc =>
                bc.category === "free" ||
                bc.category === "sure-banker"
            );
        }

        // Sort by created date, newest first
        filteredCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            betCodes: filteredCodes,
            userRole: user?.role || "guest",
            totalCount: betCodes.length,
            visibleCount: filteredCodes.length
        });
    } catch (error) {
        console.error("Error reading bet codes:", error);
        return NextResponse.json({ error: "Failed to load bet codes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Allow both authenticated users (punters) and admins to post bet codes
    const user = await getUserFromSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { bookmaker, code, link, image, description, odds, stake, expiresAt, category, confidence } = body;

        if (!bookmaker) {
            return NextResponse.json({ error: "Bookmaker is required" }, { status: 400 });
        }

        if (!code && !link && !image) {
            return NextResponse.json({ error: "At least one of code, link, or image is required" }, { status: 400 });
        }

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        const validCategories = ["free", "sure-banker", "premium", "vip"];
        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        // Get WordPress auth credentials
        const wpUser = process.env.WP_ADMIN_USER;
        const wpPass = process.env.WP_ADMIN_PASSWORD;

        if (!wpUser || !wpPass) {
            return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 500 });
        }

        // Create post in WordPress using admin credentials
        const wpResponse = await fetch(`${WP_API_URL}/bet-codes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64'),
            },
            body: JSON.stringify({
                title: `${bookmaker} - ${description.substring(0, 50)}`,
                content: description,
                status: 'publish',
                meta: {
                    bookmaker,
                    code: code || "",
                    link: link || "",
                    image: image || "",
                    odds: odds || "",
                    stake: stake || "",
                    expires_at: expiresAt || "",
                    status: "active",
                    category: category,
                    confidence: confidence || "Medium",
                    created_by_email: user.email,
                },
            }),
        });

        if (!wpResponse.ok) {
            const errorText = await wpResponse.text();
            console.error("WordPress API error:", errorText);
            return NextResponse.json({ error: "Failed to create bet code in WordPress" }, { status: 500 });
        }

        const wpPost = await wpResponse.json();
        const newBetCode = wpPostToBetCode(wpPost);

        return NextResponse.json({ betCode: newBetCode }, { status: 201 });
    } catch (error) {
        console.error("Error creating bet code:", error);
        return NextResponse.json({ error: "Failed to create bet code" }, { status: 500 });
    }
}

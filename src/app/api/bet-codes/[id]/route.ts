import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth-wordpress";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API || "https://sureodds.ng/wp-json/wp/v2";

async function getUserFromSession(req: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
    // Check user session (for punters)
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload) {
            return {
                id: payload.email,
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUserFromSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Get WordPress auth credentials
        const wpUser = process.env.WP_ADMIN_USER;
        const wpPass = process.env.WP_ADMIN_PASSWORD;

        if (!wpUser || !wpPass) {
            return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 500 });
        }

        // First, get the bet code to check ownership
        const getResponse = await fetch(`${WP_API_URL}/bet-codes/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!getResponse.ok) {
            return NextResponse.json({ error: "Bet code not found" }, { status: 404 });
        }

        const betCode = await getResponse.json();

        // Check if user is admin or the creator
        const isAdmin = user.role === "admin";
        const isCreator = betCode.meta?.created_by_email === user.email;

        if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: "You can only delete your own bet codes" }, { status: 403 });
        }

        // Delete from WordPress
        const deleteResponse = await fetch(`${WP_API_URL}/bet-codes/${id}?force=true`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64'),
            },
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error("WordPress API error:", errorText);
            return NextResponse.json({ error: "Failed to delete bet code" }, { status: 500 });
        }

        return NextResponse.json({ message: "Bet code deleted successfully" });
    } catch (error) {
        console.error("Error deleting bet code:", error);
        return NextResponse.json({ error: "Failed to delete bet code" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUserFromSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // Get WordPress auth credentials
        const wpUser = process.env.WP_ADMIN_USER;
        const wpPass = process.env.WP_ADMIN_PASSWORD;

        if (!wpUser || !wpPass) {
            return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 500 });
        }

        // First, get the bet code to check ownership
        const getResponse = await fetch(`${WP_API_URL}/bet-codes/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!getResponse.ok) {
            return NextResponse.json({ error: "Bet code not found" }, { status: 404 });
        }

        const betCode = await getResponse.json();

        // Check if user is admin or the creator
        const isAdmin = user.role === "admin";
        const isCreator = betCode.meta?.created_by_email === user.email;

        if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: "You can only update your own bet codes" }, { status: 403 });
        }

        // Prepare update data
        const updateData: any = {};

        if (body.status) {
            updateData.meta = { ...betCode.meta, status: body.status };
        }

        // Update in WordPress
        const updateResponse = await fetch(`${WP_API_URL}/bet-codes/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64'),
            },
            body: JSON.stringify(updateData),
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("WordPress API error:", errorText);
            return NextResponse.json({ error: "Failed to update bet code" }, { status: 500 });
        }

        const updatedPost = await updateResponse.json();

        return NextResponse.json({ betCode: updatedPost });
    } catch (error) {
        console.error("Error updating bet code:", error);
        return NextResponse.json({ error: "Failed to update bet code" }, { status: 500 });
    }
}

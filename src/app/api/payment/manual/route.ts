import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, findUserByEmail, updateUser } from "@/lib/auth-wordpress";
import { sendPaymentSubmittedToAdmin } from "@/lib/email";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("so_user_session")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const payload = await verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const user = await findUserByEmail(payload.email);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const contentType = req.headers.get("content-type") ?? "";
    let paymentRef = "";
    let proofUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        paymentRef = (formData.get("paymentRef") as string) ?? "";

        const file = formData.get("proofImage") as File | null;
        if (file && file.size > 0) {
            // Validate type
            if (!file.type.startsWith("image/")) {
                return NextResponse.json({ error: "Proof must be an image file." }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
            }

            const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
            const filename = `proof_${user.id}_${Date.now()}.${ext}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
            await fs.mkdir(uploadDir, { recursive: true });
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(path.join(uploadDir, filename), buffer);
            proofUrl = `/uploads/payment-proofs/${filename}`;
        }
    } else {
        const body = await req.json();
        paymentRef = body.paymentRef ?? "";
    }

    if (!paymentRef.trim()) {
        return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
    }

    await updateUser(user.id, {
        paymentMethod: "manual",
        paymentRef: paymentRef.trim(),
        ...(proofUrl ? { proofUrl } : {}),
        // status stays "pending" — admin must approve
    });

    // Notify admin via email
    await sendPaymentSubmittedToAdmin(
        { name: user.name, email: user.email },
        paymentRef.trim(),
        proofUrl ?? undefined
    );

    return NextResponse.json({ ok: true, message: "Payment submitted. Your account will be activated once admin confirms your payment." });
}

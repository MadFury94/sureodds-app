import { NextResponse } from "next/server";
import { readSettings } from "@/lib/settings";

// Public endpoint — returns only what the subscribe page needs (no secret keys)
export async function GET() {
    const s = await readSettings();
    return NextResponse.json({
        settings: {
            subscriptionPrice: s.subscriptionPrice,
            subscriptionCurrency: s.subscriptionCurrency,
            subscriptionDurationDays: s.subscriptionDurationDays,
            bankAccounts: s.bankAccounts,
            manualPaymentInstructions: s.manualPaymentInstructions,
        },
    });
}

import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "src/data/settings.json");

export interface BankAccount {
    bankName: string;
    accountName: string;
    accountNumber: string;
}

export interface SiteSettings {
    subscriptionPrice: number;
    subscriptionCurrency: string;
    subscriptionDurationDays: number;
    bankAccounts: BankAccount[];
    paystackPublicKey: string;
    manualPaymentInstructions: string;
}

export async function readSettings(): Promise<SiteSettings> {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw) as SiteSettings;
}

export async function writeSettings(settings: SiteSettings): Promise<void> {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

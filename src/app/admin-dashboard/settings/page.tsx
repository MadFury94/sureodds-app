"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";
import type { BankAccount, SiteSettings } from "@/lib/settings";

const f = fonts.body;
const fd = fonts.display;

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => { if (d.settings) setSettings(d.settings); });
    }, []);

    async function save() {
        if (!settings) return;
        setSaving(true); setMsg(null);
        const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        const data = await res.json();
        setSaving(false);
        setMsg(res.ok ? { type: "ok", text: "Settings saved." } : { type: "err", text: data.error ?? "Save failed." });
    }

    function updateBank(i: number, field: keyof BankAccount, value: string) {
        if (!settings) return;
        const accounts = [...settings.bankAccounts];
        accounts[i] = { ...accounts[i], [field]: value };
        setSettings({ ...settings, bankAccounts: accounts });
    }

    function addBank() {
        if (!settings) return;
        setSettings({ ...settings, bankAccounts: [...settings.bankAccounts, { bankName: "", accountName: "", accountNumber: "" }] });
    }

    function removeBank(i: number) {
        if (!settings) return;
        setSettings({ ...settings, bankAccounts: settings.bankAccounts.filter((_, idx) => idx !== i) });
    }

    if (!settings) return <div style={{ fontFamily: f, fontSize: "1.4rem", color: "#99989f", padding: "3.2rem" }}>Loading…</div>;

    return (
        <div style={{ maxWidth: "72rem" }}>
            <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2.4rem" }}>Settings</h1>

            {msg && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: msg.type === "ok" ? "#f0fdf4" : "#fff0f0", border: `1px solid ${msg.type === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: msg.type === "ok" ? "#16a34a" : "#dc2626", marginBottom: "2rem" }}>
                    {msg.text}
                </div>
            )}

            {/* Subscription pricing */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2.4rem", marginBottom: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2rem" }}>Subscription Pricing</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
                    <div>
                        <label style={{ display: "block", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.5rem" }}>Price</label>
                        <input type="number" value={settings.subscriptionPrice} onChange={e => setSettings({ ...settings, subscriptionPrice: Number(e.target.value) })}
                            style={{ width: "100%", padding: "0.9rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.5rem" }}>Currency</label>
                        <input value={settings.subscriptionCurrency} onChange={e => setSettings({ ...settings, subscriptionCurrency: e.target.value })}
                            style={{ width: "100%", padding: "0.9rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.5rem" }}>Duration (days)</label>
                        <input type="number" value={settings.subscriptionDurationDays} onChange={e => setSettings({ ...settings, subscriptionDurationDays: Number(e.target.value) })}
                            style={{ width: "100%", padding: "0.9rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>
                </div>
            </div>

            {/* Bank accounts */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2.4rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Bank Accounts</p>
                    <button onClick={addBank} style={{ padding: "0.6rem 1.4rem", backgroundColor: "#f9fafb", border: "1px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", cursor: "pointer" }}>+ Add Account</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    {settings.bankAccounts.map((acct, i) => (
                        <div key={i} style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem", border: "1px solid #e8ebed" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1.2rem", alignItems: "end" }}>
                                {[
                                    { label: "Bank Name", field: "bankName" as const },
                                    { label: "Account Name", field: "accountName" as const },
                                    { label: "Account Number", field: "accountNumber" as const },
                                ].map(({ label, field }) => (
                                    <div key={field}>
                                        <label style={{ display: "block", fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#68676d", marginBottom: "0.4rem" }}>{label}</label>
                                        <input value={acct[field]} onChange={e => updateBank(i, field, e.target.value)}
                                            style={{ width: "100%", padding: "0.8rem 1rem", border: "1.5px solid #e8ebed", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fff" }}
                                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                        />
                                    </div>
                                ))}
                                <button onClick={() => removeBank(i)} style={{ padding: "0.8rem 1rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.3rem", color: "#dc2626", cursor: "pointer" }}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manual payment instructions */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2.4rem", marginBottom: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.2rem" }}>Manual Payment Instructions</p>
                <textarea value={settings.manualPaymentInstructions} onChange={e => setSettings({ ...settings, manualPaymentInstructions: e.target.value })} rows={3}
                    style={{ width: "100%", padding: "1rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", resize: "vertical" }}
                    onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                    onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                />
            </div>

            {/* Paystack key */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2.4rem", marginBottom: "2.4rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.2rem" }}>Paystack Public Key</p>
                <input value={settings.paystackPublicKey} onChange={e => setSettings({ ...settings, paystackPublicKey: e.target.value })} placeholder="pk_live_..."
                    style={{ width: "100%", padding: "0.9rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                    onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                />
                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", marginTop: "0.6rem" }}>The secret key is set via environment variable PAYSTACK_SECRET_KEY — never stored here.</p>
            </div>

            <button onClick={save} disabled={saving} style={{ padding: "1.2rem 3.2rem", backgroundColor: saving ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {saving ? "Saving…" : "Save Settings"}
            </button>
        </div>
    );
}

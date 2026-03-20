"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface UserData { id: string; name: string; email: string; status: string; subscriptionExpiry: string | null; createdAt: string; role: string; }

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [name, setName] = useState("");
    const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    useEffect(() => {
        fetch("/api/auth/me").then(r => r.json()).then(d => {
            if (d.user) { setUser(d.user); setName(d.user.name); }
        });
    }, []);

    async function saveName(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setMsg(null);
        const res = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
        const data = await res.json();
        setSaving(false);
        setMsg(res.ok ? { type: "ok", text: "Name updated." } : { type: "err", text: data.error });
    }

    async function savePassword(e: React.FormEvent) {
        e.preventDefault();
        if (pw.next !== pw.confirm) { setMsg({ type: "err", text: "New passwords do not match." }); return; }
        if (pw.next.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters." }); return; }
        setSaving(true); setMsg(null);
        const res = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) });
        const data = await res.json();
        setSaving(false);
        if (res.ok) { setMsg({ type: "ok", text: "Password updated." }); setPw({ current: "", next: "", confirm: "" }); }
        else setMsg({ type: "err", text: data.error });
    }

    const expiry = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

    return (
        <div style={{ maxWidth: "56rem" }}>
            <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2.4rem" }}>My Profile</h1>

            {msg && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: msg.type === "ok" ? "#f0fdf4" : "#fff0f0", border: `1px solid ${msg.type === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: msg.type === "ok" ? "#16a34a" : "#dc2626", marginBottom: "2rem" }}>
                    {msg.text}
                </div>
            )}

            {/* Account info */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", marginBottom: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.6rem" }}>Account Info</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                    {[
                        { label: "Email", value: user?.email ?? "—" },
                        { label: "Status", value: user?.status ?? "—" },
                        { label: "Subscription Expires", value: expiry },
                        { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.3rem" }}>{label}</p>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", margin: 0 }}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Update name */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", marginBottom: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.6rem" }}>Update Name</p>
                <form onSubmit={saveName}>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required
                        style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", marginBottom: "1.2rem" }}
                        onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                        onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                    />
                    <button type="submit" disabled={saving} style={{ padding: "0.9rem 2.4rem", backgroundColor: "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>Save Name</button>
                </form>
            </div>

            {/* Change password */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem" }}>
                <p style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.6rem" }}>Change Password</p>
                <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {[
                        { label: "Current Password", key: "current" as const, placeholder: "Current password" },
                        { label: "New Password", key: "next" as const, placeholder: "Min. 8 characters" },
                        { label: "Confirm New Password", key: "confirm" as const, placeholder: "Repeat new password" },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>{label}</label>
                            <input type="password" value={pw[key]} onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required
                                style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>
                    ))}
                    <div>
                        <button type="submit" disabled={saving} style={{ padding: "0.9rem 2.4rem", backgroundColor: "#1a1a1a", border: "none", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface User {
    id: string; name: string; email: string; role: string;
    status: string; subscriptionExpiry: string | null;
    paymentMethod: string | null; paymentRef: string | null;
    proofUrl: string | null;
    createdAt: string; approvedAt: string | null;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    active: { bg: "#f0fdf4", color: "#16a34a" },
    pending: { bg: "#fff7f0", color: "#ff6b00" },
    suspended: { bg: "#fff0f0", color: "#dc2626" },
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "active" | "suspended">("all");
    const [roleFilter, setRoleFilter] = useState<"all" | "tips-admin" | "punter" | "subscriber">("all");
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
    const [addingAdmin, setAddingAdmin] = useState(false);

    useEffect(() => { loadUsers(); }, []);

    async function loadUsers() {
        setLoading(true);
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const res = await fetch(`/api/admin/users?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        const data = await res.json();
        console.log("📋 [loadUsers] Received users:", data.users?.length);
        setUsers(data.users ?? []);
        setLoading(false);
    }

    async function action(id: string, email: string, act: "approve" | "suspend") {
        setActing(id); setMsg(null);
        const res = await fetch(`/api/admin/users/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: act, email }),
        });
        const data = await res.json();
        if (res.ok) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data.user } : u));
            setMsg({ type: "ok", text: `User ${act === "approve" ? "approved" : "suspended"}.` });
        } else {
            setMsg({ type: "err", text: data.error });
        }
        setActing(null);
    }

    async function deleteUser(id: string) {
        if (!confirm("Delete this user permanently?")) return;
        setActing(id);
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
        else setMsg({ type: "err", text: "Delete failed." });
        setActing(null);
    }

    async function createTipsAdmin(e: React.FormEvent) {
        e.preventDefault();
        setAddingAdmin(true); setMsg(null);
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newAdmin, confirmPassword: newAdmin.password, role: "punter" }),
        });
        const data = await res.json();
        setAddingAdmin(false);
        if (res.ok) {
            setMsg({ type: "ok", text: "Punter created." });
            setShowAddAdmin(false);
            setNewAdmin({ name: "", email: "", password: "" });
            loadUsers();
        } else {
            setMsg({ type: "err", text: data.error });
        }
    }

    const filtered = users.filter(u => {
        const statusMatch = filter === "all" || u.status === filter;
        const roleMatch = roleFilter === "all" || u.role === roleFilter;
        return statusMatch && roleMatch;
    });
    const pendingCount = users.filter(u => u.status === "pending").length;
    const puntersPendingCount = users.filter(u => u.status === "pending" && u.role === "punter").length;
    const subscribersPendingCount = users.filter(u => u.status === "pending" && u.role === "subscriber").length;

    return (
        <div style={{ maxWidth: "120rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Users</h1>
                    {pendingCount > 0 && <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", marginTop: "0.4rem" }}>⚠ {pendingCount} pending approval</p>}
                </div>
                <button onClick={() => setShowAddAdmin(v => !v)} style={{ padding: "1rem 2rem", backgroundColor: "#1a1a1a", border: "none", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                    + Add Punter
                </button>
            </div>

            {msg && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: msg.type === "ok" ? "#f0fdf4" : "#fff0f0", border: `1px solid ${msg.type === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: msg.type === "ok" ? "#16a34a" : "#dc2626", marginBottom: "1.6rem" }}>
                    {msg.text}
                </div>
            )}

            {/* Add tips admin form */}
            {showAddAdmin && (
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", marginBottom: "2rem" }}>
                    <p style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.6rem" }}>New Punter</p>
                    <form onSubmit={createTipsAdmin} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1.2rem", alignItems: "end" }}>
                        {[
                            { label: "Name", key: "name", type: "text" },
                            { label: "Email", key: "email", type: "email" },
                            { label: "Password", key: "password", type: "password" },
                        ].map(({ label, key, type }) => (
                            <div key={key}>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.4rem" }}>{label}</label>
                                <input type={type} value={newAdmin[key as keyof typeof newAdmin]} onChange={e => setNewAdmin(p => ({ ...p, [key]: e.target.value }))} required
                                    style={{ width: "100%", padding: "0.9rem 1.2rem", border: "1.5px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a", outline: "none" }}
                                    onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                />
                            </div>
                        ))}
                        <button type="submit" disabled={addingAdmin} style={{ padding: "0.9rem 1.6rem", backgroundColor: "#ff6b00", border: "none", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                            {addingAdmin ? "…" : "Create"}
                        </button>
                    </form>
                </div>
            )}

            {/* Role filter tabs */}
            <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.6rem", borderBottom: "2px solid #e8ebed", paddingBottom: "0.4rem" }}>
                {[
                    { key: "all", label: "All Users", count: users.length },
                    { key: "tips-admin", label: "Admin", count: users.filter(u => u.role === "tips-admin").length },
                    { key: "punter", label: "Punters", count: users.filter(u => u.role === "punter").length, pending: puntersPendingCount },
                    { key: "subscriber", label: "Subscribers", count: users.filter(u => u.role === "subscriber").length, pending: subscribersPendingCount },
                ].map(({ key, label, count, pending }) => (
                    <button key={key} onClick={() => setRoleFilter(key as any)} style={{ padding: "0.8rem 1.6rem", borderRadius: "0.6rem 0.6rem 0 0", border: "none", fontFamily: fd, fontSize: "1.3rem", fontWeight: roleFilter === key ? 700 : 500, backgroundColor: roleFilter === key ? "#1a1a1a" : "transparent", color: roleFilter === key ? "#fff" : "#68676d", cursor: "pointer", position: "relative" }}>
                        {label}
                        <span style={{ marginLeft: "0.6rem", backgroundColor: roleFilter === key ? "#ff6b00" : "#e8ebed", color: roleFilter === key ? "#fff" : "#68676d", borderRadius: "10rem", padding: "0.2rem 0.6rem", fontSize: "1.1rem", fontWeight: 700 }}>
                            {count}
                        </span>
                        {pending && pending > 0 && (
                            <span style={{ position: "absolute", top: "0.4rem", right: "0.4rem", backgroundColor: "#ff6b00", color: "#fff", borderRadius: "10rem", padding: "0.1rem 0.4rem", fontSize: "0.9rem", fontWeight: 700 }}>
                                {pending}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Status filter tabs */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.6rem" }}>
                {(["all", "pending", "active", "suspended"] as const).map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{ padding: "0.6rem 1.4rem", borderRadius: "10rem", border: "1px solid #e8ebed", fontFamily: f, fontSize: "1.2rem", fontWeight: filter === s ? 700 : 500, backgroundColor: filter === s ? "#1a1a1a" : "#fff", color: filter === s ? "#fff" : "#68676d", cursor: "pointer" }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        {s === "pending" && pendingCount > 0 && <span style={{ marginLeft: "0.5rem", backgroundColor: "#ff6b00", color: "#fff", borderRadius: "10rem", padding: "0.1rem 0.5rem", fontSize: "1rem" }}>{pendingCount}</span>}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: "3.2rem", textAlign: "center", fontFamily: f, fontSize: "1.4rem", color: "#99989f" }}>Loading…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: "3.2rem", textAlign: "center", fontFamily: f, fontSize: "1.4rem", color: "#99989f" }}>No users found.</div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e8ebed" }}>
                                {["Name", "Email", "Role", "Status", "Payment", "Proof", "Expires", "Actions"].map(h => (
                                    <th key={h} style={{ padding: "1.2rem 1.6rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, i) => {
                                const st = STATUS_STYLE[user.status] ?? { bg: "#f9fafb", color: "#68676d" };
                                const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
                                return (
                                    <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                        <td style={{ padding: "1.2rem 1.6rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a" }}>{user.name}</td>
                                        <td style={{ padding: "1.2rem 1.6rem", fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>{user.email}</td>
                                        <td style={{ padding: "1.2rem 1.6rem" }}>
                                            <span style={{ padding: "0.3rem 0.8rem", borderRadius: "0.3rem", backgroundColor: user.role === "tips-admin" || user.role === "punter" ? "#f0f0ff" : "#f9fafb", fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: user.role === "tips-admin" || user.role === "punter" ? "#4f46e5" : "#68676d" }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1.2rem 1.6rem" }}>
                                            <span style={{ padding: "0.3rem 0.8rem", borderRadius: "0.3rem", backgroundColor: st.bg, fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: st.color }}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1.2rem 1.6rem", fontFamily: f, fontSize: "1.2rem", color: "#68676d" }}>
                                            {user.paymentMethod ?? "—"}
                                            {user.paymentRef && <span style={{ display: "block", fontSize: "1.1rem", color: "#99989f" }}>{user.paymentRef}</span>}
                                        </td>
                                        <td style={{ padding: "1.2rem 1.6rem" }}>
                                            {user.proofUrl ? (
                                                <a href={user.proofUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={user.proofUrl} alt="proof" style={{ height: "4rem", width: "5.6rem", objectFit: "cover", borderRadius: "0.4rem", border: "1px solid #e8ebed", display: "block" }} />
                                                </a>
                                            ) : <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>—</span>}
                                        </td>
                                        <td style={{ padding: "1.2rem 1.6rem", fontFamily: f, fontSize: "1.2rem", color: "#68676d" }}>{expiry}</td>
                                        <td style={{ padding: "1.2rem 1.6rem" }}>
                                            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                                {user.status === "pending" && (
                                                    <button onClick={() => action(user.id, user.email, "approve")} disabled={acting === user.id} style={{ padding: "0.5rem 1.1rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#16a34a", cursor: "pointer" }}>
                                                        Approve
                                                    </button>
                                                )}
                                                {user.status === "active" && (
                                                    <button onClick={() => action(user.id, user.email, "suspend")} disabled={acting === user.id} style={{ padding: "0.5rem 1.1rem", backgroundColor: "#fff7f0", border: "1px solid #fed7aa", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00", cursor: "pointer" }}>
                                                        Suspend
                                                    </button>
                                                )}
                                                {user.status === "suspended" && (
                                                    <button onClick={() => action(user.id, user.email, "approve")} disabled={acting === user.id} style={{ padding: "0.5rem 1.1rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#16a34a", cursor: "pointer" }}>
                                                        Reactivate
                                                    </button>
                                                )}
                                                <button onClick={() => deleteUser(user.id)} disabled={acting === user.id} style={{ padding: "0.5rem 1.1rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#dc2626", cursor: "pointer" }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

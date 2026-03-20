"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

// Note: metadata must be in a separate server component for client pages.
// Add this to a parent layout or use a generateMetadata export in a wrapper.

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const contacts = [
    { title: "Advertising with S/O", email: "advertise@sureodds.com", note: null },
    { title: "Press Bookings for S/O Talent", email: "media@sureodds.com", note: null },
    { title: "Press Inquiries", email: "PR@sureodds.com", note: null },
    { title: "Partnerships with S/O", email: "partners@sureodds.com", note: null },
    {
        title: "Typographical or Factual Errors",
        email: "corrections@sureodds.com",
        note: "Include the URL of the article and a brief description of the issue.",
    },
    { title: "General Questions", email: "info@sureodds.com", note: null },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSent(true);
    }

    const inputStyle = (field: string): React.CSSProperties => ({
        width: "100%",
        padding: "1.4rem 1.6rem",
        border: `1.5px solid ${focused === field ? "#1a1a1a" : "#d1d5db"}`,
        borderRadius: "0.6rem",
        fontFamily: f,
        fontSize: "1.5rem",
        color: "#1a1a1a",
        outline: "none",
        backgroundColor: "#fff",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: focused === field ? "0 0 0 3px rgba(26,26,26,0.08)" : "none",
    });

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            {/* Black page header */}
            <PageHeader
                title="Contact Us"
                subtitle="We read every message. Reach out and we'll get back to you within 1–2 business days."
                image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80"
            />

            {/* Contact form */}
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "7rem 1.2rem 6rem" }}>
                <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

                    {sent ? (
                        <div style={{
                            padding: "5rem", backgroundColor: "#f2f5f6", borderRadius: "1.2rem",
                            textAlign: "center", border: "1px solid #e8ebed",
                        }}>
                            <p style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>✅</p>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                Message Received
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                                Thanks for reaching out. We'll get back to you shortly.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Full Name <span style={{ color: "#e9173d" }}>*</span>
                                    </label>
                                    <input
                                        type="text" required placeholder="Jane Smith"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                                        style={inputStyle("name")}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Email Address <span style={{ color: "#e9173d" }}>*</span>
                                    </label>
                                    <input
                                        type="email" required placeholder="jane@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                                        style={inputStyle("email")}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Subject <span style={{ color: "#e9173d" }}>*</span>
                                </label>
                                <input
                                    type="text" required placeholder="What's this about?"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                                    style={inputStyle("subject")}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Message <span style={{ color: "#e9173d" }}>*</span>
                                </label>
                                <textarea
                                    required rows={8}
                                    placeholder="Tell us what's on your mind..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                                    style={{ ...inputStyle("message"), resize: "vertical", lineHeight: 1.65 }}
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.6rem" }}>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>
                                    Fields marked <span style={{ color: "#e9173d" }}>*</span> are required
                                </p>
                                <button type="submit" style={{
                                    padding: "1.4rem 4rem", backgroundColor: "#1a1a1a", border: "none",
                                    borderRadius: "0.6rem", fontFamily: f, fontSize: "1.5rem", fontWeight: 700,
                                    color: "#fff", cursor: "pointer", transition: "background-color 0.15s",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e9173d")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                                >
                                    Send Message
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>

            {/* Contact directory — below the form */}
            <div style={{ backgroundColor: "#f2f5f6", padding: "6rem 1.2rem" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto" }}>
                    <div style={{ maxWidth: "80rem", margin: "0 auto" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                            {contacts.map((item, i) => (
                                <div key={i} style={{
                                    padding: "3rem 4rem 3rem 0",
                                    borderBottom: i < contacts.length - 2 ? "1px solid #ddd" : "none",
                                }}>
                                    <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        {item.title}
                                    </p>
                                    {item.note && (
                                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "0.4rem", lineHeight: 1.5 }}>
                                            {item.note}
                                        </p>
                                    )}
                                    <a href={`mailto:${item.email}`} style={{
                                        fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a",
                                        textDecoration: "none", borderBottom: "1px solid #1a1a1a", paddingBottom: "0.1rem",
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.color = "#e9173d"; e.currentTarget.style.borderBottomColor = "#e9173d"; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.borderBottomColor = "#1a1a1a"; }}
                                    >
                                        {item.email}
                                    </a>
                                </div>
                            ))}
                        </div>

                        {/* Support */}
                        <div style={{ paddingTop: "3rem", borderTop: "1px solid #ddd" }}>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", marginBottom: "0.4rem" }}>
                                Support
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                                Need help? Email us at{" "}
                                <a href="mailto:support@sureodds.com" style={{ color: "#BD4110", textDecoration: "none", borderBottom: "1px solid #BD4110" }}>
                                    support@sureodds.com
                                </a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

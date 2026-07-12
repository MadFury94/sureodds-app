"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const contacts = [
    { title: "Advertising", email: "advertise@sureodds.ng", note: null },
    { title: "Press Bookings", email: "media@sureodds.ng", note: null },
    { title: "Press Inquiries", email: "PR@sureodds.ng", note: null },
    { title: "Partnerships", email: "partners@sureodds.ng", note: null },
    { title: "Corrections", email: "corrections@sureodds.ng", note: "Include the article URL and a brief description." },
    { title: "General Questions", email: "info@sureodds.ng", note: null },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSent(true);
                } else {
                    setError(data.error ?? "Something went wrong. Please try again.");
                }
            })
            .catch(() => setError("Something went wrong. Please try again."))
            .finally(() => setSubmitting(false));
    }

    const inp = (field: string): React.CSSProperties => ({
        width: "100%",
        padding: "1.4rem 1.6rem",
        border: `1.5px solid ${focused === field ? "#1a1a1a" : "#d1d5db"}`,
        borderRadius: "0.6rem",
        fontFamily: f,
        fontSize: "1.5rem",
        color: "#1a1a1a",
        outline: "none",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
    });

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .contact-wrap  { max-width: 132.48rem; margin: 0 auto; padding: 6rem 1.6rem 5rem; }
                .contact-inner { max-width: 72rem; margin: 0 auto; }

                /* Name + email row */
                .contact-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

                /* Directory grid */
                .contact-dir   { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                .contact-dir-item {
                    padding: 2.4rem 3.2rem 2.4rem 0;
                    border-bottom: 1px solid #e8ebed;
                }
                .contact-dir-item:nth-last-child(-n+2) { border-bottom: none; }

                .contact-link { color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #1a1a1a; padding-bottom: 0.1rem; font-family: ${f}; font-size: 1.4rem; }
                .contact-link:hover { color: #ff6b00; border-bottom-color: #ff6b00; }

                /* Submit row */
                .contact-submit-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.6rem; }

                .contact-btn {
                    padding: 1.4rem 3.6rem;
                    background: #1a1a1a; border: none; border-radius: 0.6rem;
                    font-family: ${f}; font-size: 1.5rem; font-weight: 700; color: #fff;
                    cursor: pointer; transition: background 0.15s; width: 100%;
                }
                .contact-btn:hover { background: #ff6b00; }

                @media (max-width: 600px) {
                    .contact-wrap  { padding: 3.2rem 1.6rem 4rem; }
                    .contact-row   { grid-template-columns: 1fr; gap: 1.6rem; }
                    .contact-dir   { grid-template-columns: 1fr; }
                    .contact-dir-item { padding: 2rem 0; border-bottom: 1px solid #e8ebed !important; }
                    .contact-dir-item:last-child { border-bottom: none !important; }
                    .contact-submit-row { flex-direction: column; align-items: stretch; }
                }
            `}</style>

            <PageHeader
                title="Contact Us"
                subtitle="We read every message. Reach out and we'll get back to you within 1–2 business days."
                image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80"
            />

            {/* Form */}
            <div className="contact-wrap">
                <div className="contact-inner">
                    {sent ? (
                        <div style={{ padding: "5rem 2rem", backgroundColor: "#f2f5f6", borderRadius: "1.2rem", textAlign: "center", border: "1px solid #e8ebed" }}>
                            <p style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>✅</p>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>Message Received</h3>
                            <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Thanks for reaching out. We'll get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                            <div className="contact-row">
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Full Name <span style={{ color: "#ff6b00" }}>*</span>
                                    </label>
                                    <input type="text" required placeholder="Jane Smith"
                                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                                        style={inp("name")} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Email Address <span style={{ color: "#ff6b00" }}>*</span>
                                    </label>
                                    <input type="email" required placeholder="jane@example.com"
                                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                                        style={inp("email")} />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Subject <span style={{ color: "#ff6b00" }}>*</span>
                                </label>
                                <input type="text" required placeholder="What's this about?"
                                    value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                    onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                                    style={inp("subject")} />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Message <span style={{ color: "#ff6b00" }}>*</span>
                                </label>
                                <textarea required rows={7} placeholder="Tell us what's on your mind..."
                                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                    onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                                    style={{ ...inp("message"), resize: "vertical", lineHeight: 1.65 }} />
                            </div>

                            <div className="contact-submit-row">
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>
                                    Fields marked <span style={{ color: "#ff6b00" }}>*</span> are required
                                </p>
                                <button type="submit" className="contact-btn" disabled={submitting}
                                    style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>
                            </div>
                            {error && (
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", textAlign: "center" }}>{error}</p>
                            )}
                        </form>
                    )}
                </div>
            </div>

            {/* Directory */}
            <div style={{ backgroundColor: "#f2f5f6", padding: "5rem 1.6rem" }}>
                <div style={{ maxWidth: "80rem", margin: "0 auto" }}>

                    <div className="contact-dir">
                        {contacts.map((item, i) => (
                            <div key={i} className="contact-dir-item">
                                <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", marginBottom: "0.4rem" }}>
                                    {item.title}
                                </p>
                                {item.note && (
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                                        {item.note}
                                    </p>
                                )}
                                <a href={`mailto:${item.email}`} className="contact-link">
                                    {item.email}
                                </a>
                            </div>
                        ))}
                    </div>

                    <div style={{ paddingTop: "2.4rem", borderTop: "1px solid #ddd", marginTop: "0.4rem" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", marginBottom: "0.4rem" }}>Support</p>
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                            Need help? Email{" "}
                            <a href="mailto:support@sureodds.ng" className="contact-link" style={{ color: "#ff6b00", borderBottomColor: "#ff6b00" }}>
                                support@sureodds.ng
                            </a>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}

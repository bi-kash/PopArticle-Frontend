import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import siteConfig from "@/lib/siteConfig";
import { messageService } from "@/lib/messageService";
import {
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await messageService.sendMessage(formData, null);
      setStatus({
        type: "success",
        text: "Message sent! We'll be in touch within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error.response?.data?.error ||
          "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const INFO_CARDS = [
    {
      icon: Mail,
      title: "Email us",
      desc: "Send us an email any time",
      value: siteConfig.contactEmail,
    },
    {
      icon: Clock,
      title: "Response time",
      desc: "We usually reply within",
      value: "24 hours",
    },
    {
      icon: Zap,
      title: "Support",
      desc: "For urgent issues check",
      value: "our docs first",
      href: "/docs",
    },
  ];

  return (
    <>
      <Head>
        <title>Contact Us — {siteConfig.siteName}</title>
        <meta
          name="description"
          content={`Get in touch with the ${siteConfig.siteName} team.`}
        />
      </Head>

      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Navbar />

        {/* Hero */}
        <section
          style={{
            background:
              "linear-gradient(155deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
            padding: "5rem 1.5rem 4rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
              top: "-150px",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "2rem",
                padding: "0.375rem 1rem",
                marginBottom: "1.25rem",
                color: "#a5b4fc",
                fontSize: "0.8375rem",
                fontWeight: 600,
              }}
            >
              <MessageSquare size={13} />
              Get in touch
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              We&apos;d love to{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                hear from you
              </span>
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "1.0625rem",
                lineHeight: 1.65,
              }}
            >
              Have a question, idea, or need help? Our team is here for you.
            </p>
          </div>
        </section>

        {/* Info cards */}
        <section style={{ background: "#f8fafc", padding: "2.5rem 1.5rem" }}>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {INFO_CARDS.map(({ icon: Icon, title, desc, value, href }) => (
              <div
                key={title}
                style={{
                  background: "white",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.625rem",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {desc}
                  </div>
                  {href ? (
                    <Link
                      href={href}
                      style={{
                        color: "#6366f1",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {value}
                    </Link>
                  ) : (
                    <div
                      style={{
                        color: "#6366f1",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form section */}
        <section
          style={{ flex: 1, background: "#f8fafc", padding: "0 1.5rem 5rem" }}
        >
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div
              style={{
                background: "white",
                borderRadius: "1.25rem",
                border: "1px solid var(--border-color)",
                padding: "2.5rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.375rem",
                }}
              >
                Send us a message
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  marginBottom: "1.75rem",
                }}
              >
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>

              {status.text && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.875rem 1rem",
                    borderRadius: "0.625rem",
                    marginBottom: "1.5rem",
                    background:
                      status.type === "success" ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                    color: status.type === "success" ? "#15803d" : "#dc2626",
                    fontSize: "0.875rem",
                  }}
                >
                  {status.type === "success" && <CheckCircle2 size={15} />}
                  {status.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name + Email row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                  className="contact-form-row"
                >
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        fontSize: "0.8375rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.375rem",
                      }}
                    >
                      Your name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        fontSize: "0.8375rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.375rem",
                      }}
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="subject"
                    style={{
                      display: "block",
                      fontSize: "0.8375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="input"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What can we help you with?"
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: "0.8375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="input"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us more about your question or issue…"
                    style={{ resize: "vertical", minHeight: "120px" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: loading
                      ? "#a5b4fc"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5625rem",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: loading
                      ? "none"
                      : "0 4px 14px rgba(99,102,241,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Sending…" : "Send Message"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 560px) {
          .contact-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

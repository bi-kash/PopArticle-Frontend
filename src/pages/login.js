import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { authService } from "@/lib/authService";
import SocialAuth from "@/components/SocialAuth";
import Logo from "@/components/Logo";
import siteConfig from "@/lib/siteConfig";
import { Mail, Lock, ArrowRight, Sparkles, Zap, Globe } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (router.query.email) {
      setFormData((prev) => ({ ...prev, email: router.query.email }));
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      const pendingInvitation = sessionStorage.getItem("pending_invitation_token");
      if (pendingInvitation) {
        router.push(`/invitations/accept?token=${pendingInvitation}&auto=true`);
        return;
      }
      const redirect = router.query.redirect || "/dashboard";
      router.push(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const PERKS = [
    { icon: Sparkles, text: "AI-powered article generation" },
    { icon: Globe, text: "Multi-tenant blog management" },
    { icon: Zap, text: "Automated scheduling & publishing" },
  ];

  return (
    <>
      <Head>
        <title>Sign In — {siteConfig.siteName}</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          fontFamily: "inherit",
        }}
        className="auth-page-grid"
      >
        {/* ── Left panel (dark, brand) ── */}
        <div
          style={{
            background: "linear-gradient(155deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
            display: "flex",
            flexDirection: "column",
            padding: "2.5rem",
            position: "relative",
            overflow: "hidden",
          }}
          className="auth-left-panel"
        >
          {/* Glow blobs */}
          <div
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
              top: "-80px",
              right: "-80px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
              bottom: "80px",
              left: "-60px",
              pointerEvents: "none",
            }}
          />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Logo variant="light" size="default" />
          </div>

          {/* Hero copy */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              Welcome back.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Create more, faster.
              </span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.9375rem",
                lineHeight: 1.65,
                maxWidth: "340px",
                marginBottom: "2rem",
              }}
            >
              Sign in to continue generating and publishing AI-powered content across all your sites.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {PERKS.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "0.5rem",
                      background: "rgba(99,102,241,0.2)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} color="#a5b4fc" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.8rem",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              &ldquo;We went from 4 articles a week to 4 a day — without sacrificing quality.&rdquo;
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: "0.375rem" }}>
              — Sarah Chen, Content Marketing Lead
            </p>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem 2rem",
            background: "#ffffff",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.375rem",
                }}
              >
                {router.query.invitation ? "Sign in to accept invitation" : "Sign in"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {router.query.invitation
                  ? "Sign in to accept your team invitation"
                  : "Don't have an account? "}
                {!router.query.invitation && (
                  <Link
                    href="/register"
                    style={{ color: "#6366f1", fontWeight: 600 }}
                  >
                    Create one free
                  </Link>
                )}
              </p>
            </div>

            {router.query.invitation && (
              <div
                style={{
                  background: "#ede9fe",
                  border: "1px solid #c4b5fd",
                  borderRadius: "0.625rem",
                  padding: "0.875rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.85rem",
                  color: "#5b21b6",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Mail size={15} />
                <span><strong>Invitation pending.</strong> Sign in to accept it.</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.625rem",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: "1rem" }}>
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
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-secondary)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "0.8375rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-secondary)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.125rem 0.25rem",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
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
                  boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1.5rem 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
            </div>

            <SocialAuth />

            <p
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              <Link href="/" style={{ color: "var(--text-secondary)" }}>
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .auth-page-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-left-panel {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

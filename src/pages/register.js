import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { authService } from "@/lib/authService";
import SocialAuth from "@/components/SocialAuth";
import Logo from "@/components/Logo";
import siteConfig from "@/lib/siteConfig";
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
  });
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
      await authService.register(formData);
      const pendingInvitation = sessionStorage.getItem(
        "pending_invitation_token",
      );
      if (pendingInvitation) {
        router.push(`/invitations/accept?token=${pendingInvitation}&auto=true`);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const BENEFITS = [
    "Generate unlimited AI articles",
    "Manage multiple sites from one dashboard",
    "Schedule & auto-publish content",
    "Team collaboration & access control",
    "Analytics & performance tracking",
  ];

  return (
    <>
      <Head>
        <title>Create Account — {siteConfig.siteName}</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
        className="auth-page-grid"
      >
        {/* ── Left panel (dark, brand) ── */}
        <div
          style={{
            background:
              "linear-gradient(155deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
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
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)",
              top: "-100px",
              right: "-100px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              bottom: "60px",
              left: "-80px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Logo variant="light" size="default" />
          </div>

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
                marginBottom: "0.875rem",
              }}
            >
              Start for free.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Scale without limits.
              </span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                maxWidth: "340px",
                marginBottom: "1.75rem",
              }}
            >
              Join thousands of content creators and teams using{" "}
              {siteConfig.siteName} to publish smarter.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.875rem",
                  }}
                >
                  <CheckCircle2
                    size={16}
                    color="#4ade80"
                    style={{ flexShrink: 0 }}
                  />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: "1.25rem",
              marginTop: "1.25rem",
              display: "flex",
              gap: "2rem",
            }}
          >
            {[
              ["10k+", "Creators"],
              ["50k+", "Articles"],
              ["99.9%", "Uptime"],
            ].map(([num, label]) => (
              <div key={label}>
                <div
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.75rem",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
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
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <div style={{ marginBottom: "1.75rem" }}>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.375rem",
                }}
              >
                {router.query.invitation
                  ? "Create account to accept invitation"
                  : "Create your account"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{ color: "#6366f1", fontWeight: 600 }}
                >
                  Sign in
                </Link>
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
                <span>
                  <strong>Invitation pending.</strong> Sign up to accept it.
                </span>
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
              {/* Two-column: full name + username */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <label
                    htmlFor="full_name"
                    style={{
                      display: "block",
                      fontSize: "0.8375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Full name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User
                      size={14}
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      className="input"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    style={{
                      display: "block",
                      fontSize: "0.8375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <AtSign
                      size={14}
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="input"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="johndoe"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: "0.75rem" }}>
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
                    size={14}
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
                    size={14}
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
                    placeholder="Min. 8 characters"
                    minLength="8"
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
                  boxShadow: loading
                    ? "none"
                    : "0 4px 14px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Creating account…" : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1.25rem 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--border-color)",
                }}
              />
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                or sign up with
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--border-color)",
                }}
              />
            </div>

            <SocialAuth />

            <p
              style={{
                textAlign: "center",
                marginTop: "1.25rem",
                fontSize: "0.775rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              By creating an account you agree to our{" "}
              <Link href="/terms-of-service" style={{ color: "#6366f1" }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" style={{ color: "#6366f1" }}>
                Privacy Policy
              </Link>
              .
            </p>

            <p
              style={{
                textAlign: "center",
                marginTop: "0.75rem",
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

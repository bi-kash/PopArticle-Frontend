import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";
import SocialAuth from "@/components/SocialAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill email from query parameter (for invitations)
    if (router.query.email) {
      setFormData((prev) => ({ ...prev, email: router.query.email }));
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password,
      );

      // Check if there's a pending invitation
      const pendingInvitation = sessionStorage.getItem(
        "pending_invitation_token",
      );
      if (pendingInvitation) {
        // Don't remove token yet - let accept page handle it
        router.push(`/invitations/accept?token=${pendingInvitation}&auto=true`);
        return;
      }

      // Normal redirect logic
      const redirect = router.query.redirect || "/dashboard";
      router.push(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="card"
          style={{ maxWidth: "400px", width: "100%", margin: "1rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {router.query.invitation
                ? "Sign In to Accept Invitation"
                : "Welcome Back"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {router.query.invitation
                ? "Sign in to accept your team invitation"
                : "Sign in to your account"}
            </p>
          </div>

          {router.query.invitation && (
            <div
              style={{
                background: "#e6f2ff",
                border: "1px solid #667eea",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#667eea" }}>
                <strong>📧 Invitation Pending</strong>
                <br />
                Sign in to accept your invitation
              </p>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">
                Email Address
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

            <div className="form-group">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <SocialAuth />

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ color: "var(--primary-color)", fontWeight: 500 }}
              >
                Sign up
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Link
              href="/"
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";
import SocialAuth from "@/components/SocialAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      console.log("Sending registration data:", formData);
      const response = await authService.register(formData);
      console.log("Registration response:", response);

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
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);

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
          padding: "2rem 0",
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
                ? "Create Account to Accept Invitation"
                : "Create Account"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {router.query.invitation
                ? "Sign up to accept your team invitation"
                : "Sign up to get started"}
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
                Create an account to accept your invitation
              </p>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="full_name">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="input"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johndoe"
              />
            </div>

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
                minLength="8"
              />
              <p
                className="error"
                style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}
              >
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <SocialAuth />

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ color: "var(--primary-color)", fontWeight: 500 }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              By signing up, you agree to our{" "}
              <Link
                href="/terms-of-service"
                style={{ color: "var(--primary-color)" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                style={{ color: "var(--primary-color)" }}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
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

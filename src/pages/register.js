import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";
import SocialAuth from "@/components/SocialAuth";

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

  <SocialAuth />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.register(formData);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
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
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
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
            Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Sign up to get started
          </p>
        </div>

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
          <Link
            href="/"
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

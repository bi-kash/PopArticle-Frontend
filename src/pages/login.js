import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
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
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Sign in to your account
          </p>
        </div>

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
  );
}

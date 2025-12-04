import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "1rem 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>PopArticle</h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link href="/login">
              <button
                className="btn"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                Login
              </button>
            </Link>
            <Link href="/register">
              <button
                className="btn"
                style={{ background: "white", color: "#667eea" }}
              >
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "var(--surface)",
        }}
      >
        <div
          className="container"
          style={{ textAlign: "center", padding: "4rem 1rem" }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--text-primary)",
            }}
          >
            AI-Powered Content Platform
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            Create, manage, and publish articles with AI assistance. Support
            multi-tenant websites with ease.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/register">
              <button
                className="btn btn-primary"
                style={{ padding: "0.75rem 2rem", fontSize: "1.125rem" }}
              >
                Get Started Free
              </button>
            </Link>
            <Link href="/login">
              <button
                className="btn btn-secondary"
                style={{ padding: "0.75rem 2rem", fontSize: "1.125rem" }}
              >
                Sign In
              </button>
            </Link>
          </div>

          {/* Features */}
          <div
            style={{
              marginTop: "4rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            <div className="card">
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                🤖 AI Generation
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Generate high-quality articles with AI assistance
              </p>
            </div>
            <div className="card">
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                ✍️ HTML & Markdown
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Edit content in HTML or Markdown format
              </p>
            </div>
            <div className="card">
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                🏢 Multi-Tenant
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Manage multiple websites from one platform
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "var(--text-primary)",
          color: "white",
          padding: "2rem 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p>&copy; 2025 PopArticle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

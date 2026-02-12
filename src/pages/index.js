import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/lib/authService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <Navbar />

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
      <Footer />
    </div>
  );
}

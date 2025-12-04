import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { authService } from "@/lib/authService";
import { articleService } from "@/lib/articleService";
import { tenantService } from "@/lib/tenantService";
import { FileText, Building2, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    articles: 0,
    tenants: 0,
    published: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = authService.getUser();
      setUser(userData);

      // Load articles
      const articlesData = await articleService.getArticles({ limit: 5 });
      setRecentArticles(articlesData.articles || []);

      // Load tenants
      const tenantsData = await tenantService.getMyTenants();

      setStats({
        articles: articlesData.total || 0,
        tenants: tenantsData.tenants?.length || 0,
        published:
          articlesData.articles?.filter((a) => a.status === "published")
            .length || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Welcome back, {user?.full_name}!
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Here&apos;s what&apos;s happening with your content today.
          </p>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                    Total Articles
                  </p>
                  <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {stats.articles}
                  </h3>
                </div>
                <FileText size={40} style={{ opacity: 0.8 }} />
              </div>
            </div>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                    Published
                  </p>
                  <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {stats.published}
                  </h3>
                </div>
                <TrendingUp size={40} style={{ opacity: 0.8 }} />
              </div>
            </div>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                    Tenants
                  </p>
                  <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {stats.tenants}
                  </h3>
                </div>
                <Building2 size={40} style={{ opacity: 0.8 }} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              Quick Actions
            </h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/dashboard/articles/new">
                <button className="btn btn-primary">
                  <FileText size={20} />
                  New Article
                </button>
              </Link>
              <Link href="/dashboard/articles/generate">
                <button className="btn btn-success">Generate with AI</button>
              </Link>
              <Link href="/dashboard/tenants/new">
                <button className="btn btn-secondary">
                  <Building2 size={20} />
                  Register Tenant
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Articles */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                Recent Articles
              </h2>
              <Link
                href="/dashboard/articles"
                style={{ color: "var(--primary-color)", fontWeight: 500 }}
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : recentArticles.length === 0 ? (
              <p
                style={{
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                No articles yet. Create your first article!
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentArticles.map((article) => (
                      <tr key={article.id}>
                        <td style={{ fontWeight: 500 }}>{article.title}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              article.status === "published"
                                ? "success"
                                : article.status === "draft"
                                ? "warning"
                                : "info"
                            }`}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {new Date(article.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <Link href={`/dashboard/articles/${article.id}`}>
                            <button
                              className="btn"
                              style={{
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.875rem",
                              }}
                            >
                              Edit
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

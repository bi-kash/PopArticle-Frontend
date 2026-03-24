import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { articleService } from "@/lib/articleService";
import {
  FileText,
  Plus,
  TrendingUp,
  Users,
  ArrowLeft,
  Edit,
  Eye,
  FolderTree,
  UserCog,
  Mail,
  Calendar,
  Share2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export default function TenantDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState({
    total_articles: 0,
    published_articles: 0,
    draft_articles: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDashboardData();
    }
  }, [id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Try to load tenant details directly first
      let tenantData;
      try {
        tenantData = await tenantService.getTenant(id);

        setTenant(tenantData.tenant || tenantData);
      } catch (err) {
        // If 403, try to find it in my-tenants list
        if (err.response?.status === 403 || err.response?.status === 404) {
          const myTenantsData = await tenantService.getMyTenants();
          const myTenants = myTenantsData.tenants || [];
          const foundTenant = myTenants.find((t) => t.id == id || t.id === id);

          if (foundTenant) {
            setTenant(foundTenant);
          } else {
            throw new Error("Tenant not found or you don't have access");
          }
        } else {
          throw err;
        }
      }

      // Load all articles for this tenant to calculate stats
      try {
        const articlesData = await articleService.getArticles({
          tenant_id: id,
        });

        const articlesList = articlesData.articles || articlesData.data || [];

        // Backend now filters by X-Tenant-ID header, so we get only tenant's articles
        const calculatedStats = {
          total_articles: articlesList.length,
          published_articles: articlesList.filter(
            (a) => a.status === "published",
          ).length,
          draft_articles: articlesList.filter((a) => a.status === "draft")
            .length,
        };
        setStats(calculatedStats);

        // Set recent articles (first 5)
        setRecentArticles(articlesList.slice(0, 5));
      } catch (err) {
        console.error("Failed to load articles:", err);
        // If articles fail to load, keep default stats at 0
      }
    } catch (error) {
      console.error("Failed to load tenant dashboard:", error);

      const errorMessage =
        error.response?.status === 403
          ? "You don't have permission to access this tenant"
          : error.response?.data?.message || error.message;

      alert(`Failed to load tenant dashboard: ${errorMessage}`);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!loading && !tenant) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Tenant not found or you don't have access
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              The tenant ID {id} could not be loaded. It may not exist or you
              may not have permission to access it.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              <ArrowLeft size={16} />
              Back to Main Dashboard
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {tenant.name}
                  </h1>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {tenant.primary_domain}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link href={`/dashboard/tenants/${id}/articles/new`}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.25rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={18} />
                    New Article
                  </button>
                </Link>
                <Link href={`/dashboard/tenants/${id}/edit`}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.25rem",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Edit size={18} />
                    Settings
                  </button>
                </Link>
              </div>
            </div>
          </div>

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
                    {stats.total_articles || 0}
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
                    {stats.published_articles || 0}
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
                    Draft Articles
                  </p>
                  <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {stats.draft_articles || 0}
                  </h3>
                </div>
                <Edit size={40} style={{ opacity: 0.8 }} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1.25rem",
              }}
            >
              Quick Actions
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  href: `/dashboard/tenants/${id}/articles/new`,
                  icon: Plus,
                  label: "Create Article",
                  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                },
                {
                  href: `/dashboard/tenants/${id}/articles/generate`,
                  icon: Sparkles,
                  label: "Generate with AI",
                  gradient: "linear-gradient(135deg, #10b981, #059669)",
                },
                {
                  href: `/dashboard/tenants/${id}/scheduling`,
                  icon: Calendar,
                  label: "Scheduling",
                  gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
                },
                {
                  href: `/dashboard/tenants/${id}/articles`,
                  icon: Eye,
                  label: "All Articles",
                  outline: true,
                },
                {
                  href: `/dashboard/tenants/${id}/messages`,
                  icon: Mail,
                  label: "Messages",
                  outline: true,
                },
                {
                  href: `/dashboard/tenants/${id}/categories`,
                  icon: FolderTree,
                  label: "Categories",
                  outline: true,
                },
                {
                  href: `/dashboard/tenants/${id}/members`,
                  icon: Users,
                  label: "Members",
                  outline: true,
                },
                {
                  href: `/dashboard/tenants/${id}/team`,
                  icon: UserCog,
                  label: "Team",
                  outline: true,
                },
                {
                  href: `/dashboard/tenants/${id}/social-media`,
                  icon: Share2,
                  label: "Social Media",
                  outline: true,
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        width: "100%",
                        background: action.gradient || "var(--surface)",
                        color: action.gradient
                          ? "white"
                          : "var(--text-primary)",
                        border: action.gradient
                          ? "none"
                          : "1px solid var(--border-color)",
                        borderRadius: "0.75rem",
                        fontWeight: action.gradient ? 600 : 500,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Icon size={18} />
                      {action.label}
                    </button>
                  </Link>
                );
              })}
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
                href={`/dashboard/tenants/${id}/articles`}
                style={{ color: "var(--primary-color)", fontWeight: 500 }}
              >
                View all →
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <FileText
                  size={48}
                  style={{ margin: "0 auto 1rem", opacity: 0.5 }}
                />
                <p style={{ marginBottom: "1.5rem" }}>
                  No articles yet. Create your first article for this tenant!
                </p>
                <Link href={`/dashboard/tenants/${id}/articles/new`}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={20} />
                    Create First Article
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid var(--border-color)" }}
                    >
                      <th
                        style={{
                          textAlign: "left",
                          padding: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Title
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Created
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentArticles.map((article) => (
                      <tr
                        key={article.id}
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <td style={{ padding: "1rem", fontWeight: 500 }}>
                          {article.title}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "1rem",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              background:
                                article.status === "published"
                                  ? "#d1fae5"
                                  : article.status === "draft"
                                    ? "#fef3c7"
                                    : "#dbeafe",
                              color:
                                article.status === "published"
                                  ? "#065f46"
                                  : article.status === "draft"
                                    ? "#92400e"
                                    : "#1e40af",
                            }}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {new Date(article.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <Link
                            href={`/dashboard/tenants/${id}/articles/${article.id}`}
                          >
                            <button
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                background:
                                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "white",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              <Edit size={16} />
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

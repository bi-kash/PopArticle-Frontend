import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { tenantService } from "@/lib/tenantService";
import { authService } from "@/lib/authService";
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
  Key,
  Copy,
  Check,
  Trash2,
} from "lucide-react";

export default function TenantDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const {
    tenant: resolvedTenant,
    tenantId: resolvedId,
    loading: tenantLoading,
    error: tenantError,
  } = useTenantBySlug();
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState({
    total_articles: 0,
    published_articles: 0,
    draft_articles: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userTenantRole, setUserTenantRole] = useState(null);

  // Sync tenant from hook once resolved
  useEffect(() => {
    if (resolvedTenant) setTenant(resolvedTenant);
  }, [resolvedTenant]);

  // Load article stats and check user role once we have the real UUID
  useEffect(() => {
    if (resolvedId) {
      loadArticleStats(resolvedId);
      loadUserRole(resolvedId);
    }
  }, [resolvedId]);

  // Show error if hook fails to resolve tenant
  useEffect(() => {
    if (tenantError) {
      alert(`Failed to load tenant dashboard: ${tenantError}`);
      router.push("/dashboard");
    }
  }, [tenantError]);

  const loadUserRole = async (tenantUUID) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.is_super_admin) {
        setUserTenantRole("owner");
        return;
      }
      const data = await tenantService.getTenantMembers(tenantUUID);
      const members = data.members || data || [];
      const me = members.find(
        (m) => m.user_id === currentUser?.id || m.email === currentUser?.email,
      );
      setUserTenantRole(me?.role || null);
    } catch (err) {
      console.error("Failed to check user role:", err);
    }
  };

  const canViewCredentials =
    userTenantRole === "owner" || userTenantRole === "admin";

  const loadArticleStats = async (tenantUUID) => {
    try {
      setStatsLoading(true);
      // Fetch totals using limit=1 to get counts cheaply, plus recent articles
      const [allData, publishedData, draftData] = await Promise.all([
        articleService.getArticles({ tenant_id: tenantUUID, limit: 5 }),
        articleService.getArticles({
          tenant_id: tenantUUID,
          limit: 1,
          status: "published",
        }),
        articleService.getArticles({
          tenant_id: tenantUUID,
          limit: 1,
          status: "draft",
        }),
      ]);
      setStats({
        total_articles: allData.total ?? (allData.articles || []).length,
        published_articles:
          publishedData.total ?? (publishedData.articles || []).length,
        draft_articles: draftData.total ?? (draftData.articles || []).length,
      });
      setRecentArticles(allData.articles || []);
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const [copiedTenantId, setCopiedTenantId] = useState(false);

  const handleDeleteArticle = async (articleId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await articleService.deleteArticle(articleId, resolvedId || id);
      setRecentArticles((prev) => prev.filter((a) => a.id !== articleId));
      setStats((prev) => ({
        ...prev,
        total_articles: Math.max(0, prev.total_articles - 1),
      }));
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const handleCopyTenantId = async () => {
    if (!tenant?.id) return;
    try {
      await navigator.clipboard.writeText(String(tenant.id));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = String(tenant.id);
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedTenantId(true);
    setTimeout(() => setCopiedTenantId(false), 2000);
  };

  const loading = tenantLoading || statsLoading;

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
                background: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "0.625rem",
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
                gap: "0.375rem",
                padding: "0.4rem 0.875rem",
                background: "none",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.8125rem",
                marginBottom: "1.25rem",
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "0.75rem",
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6366f1",
                    flexShrink: 0,
                  }}
                >
                  <LayoutDashboard size={22} />
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginBottom: "0.125rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {tenant.name}
                  </h1>
                  {tenant.primary_domain && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {tenant.primary_domain}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/dashboard/tenants/${id}/articles/new`}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.6rem 1rem",
                      background: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.625rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <Plus size={16} />
                    New Article
                  </button>
                </Link>
                <Link href={`/dashboard/tenants/${id}/edit`}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.6rem 1rem",
                      background: "var(--background)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.625rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <Edit size={16} />
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
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {[
              {
                label: "Total Articles",
                value: stats.total_articles || 0,
                icon: FileText,
                accent: "#6366f1",
                bg: "#eef2ff",
              },
              {
                label: "Published",
                value: stats.published_articles || 0,
                icon: TrendingUp,
                accent: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: "Drafts",
                value: stats.draft_articles || 0,
                icon: Edit,
                accent: "#d97706",
                bg: "#fffbeb",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  className="card"
                  key={stat.label}
                  style={{ padding: "1.25rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </p>
                      <h3
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {stat.value}
                      </h3>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "0.75rem",
                        background: stat.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={stat.accent} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--text-primary)",
              }}
            >
              Quick Actions
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "0.625rem",
              }}
            >
              {[
                {
                  href: `/dashboard/tenants/${id}/articles/new`,
                  icon: Plus,
                  label: "Create Article",
                  primary: true,
                },
                {
                  href: `/dashboard/tenants/${id}/articles/generate`,
                  icon: Sparkles,
                  label: "Generate with AI",
                  primary: true,
                },
                {
                  href: `/dashboard/tenants/${id}/scheduling`,
                  icon: Calendar,
                  label: "Scheduling",
                },
                {
                  href: `/dashboard/tenants/${id}/articles`,
                  icon: Eye,
                  label: "All Articles",
                },
                {
                  href: `/dashboard/tenants/${id}/messages`,
                  icon: Mail,
                  label: "Messages",
                },
                {
                  href: `/dashboard/tenants/${id}/categories`,
                  icon: FolderTree,
                  label: "Categories",
                },
                {
                  href: `/dashboard/tenants/${id}/members`,
                  icon: Users,
                  label: "Members",
                },
                {
                  href: `/dashboard/tenants/${id}/team`,
                  icon: UserCog,
                  label: "Team",
                },
                {
                  href: `/dashboard/tenants/${id}/social-media`,
                  icon: Share2,
                  label: "Social Media",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 0.875rem",
                        width: "100%",
                        background: action.primary
                          ? "var(--primary-color)"
                          : "var(--background)",
                        color: action.primary ? "white" : "var(--text-primary)",
                        border: action.primary
                          ? "none"
                          : "1px solid var(--border-color)",
                        borderRadius: "0.625rem",
                        fontWeight: action.primary ? 600 : 500,
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        transition: "opacity 0.15s",
                      }}
                    >
                      <Icon size={16} />
                      {action.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tenant Credentials — only for owner/admin */}
          {canViewCredentials && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "0.625rem",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Key size={18} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>
                      Credentials
                    </h2>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      Tenant ID
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.875rem 1rem",
                  background: "var(--background, #f8f9fa)",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--border-color)",
                  gap: "1rem",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Tenant ID
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      letterSpacing: "0.04em",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ••••••••‑••••‑••••‑••••‑••••••••••••
                  </div>
                </div>
                <button
                  onClick={handleCopyTenantId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.45rem 0.875rem",
                    flexShrink: 0,
                    background: copiedTenantId ? "#d1fae5" : "var(--surface)",
                    color: copiedTenantId ? "#065f46" : "var(--text-secondary)",
                    border: `1px solid ${
                      copiedTenantId ? "#6ee7b7" : "var(--border-color)"
                    }`,
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  {copiedTenantId ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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
                      background: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.625rem",
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
                          <div
                            style={{ display: "inline-flex", gap: "0.5rem" }}
                          >
                            <Link
                              href={`/dashboard/tenants/${id}/articles/${article.id}`}
                            >
                              <button
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.375rem",
                                  padding: "0.4rem 0.875rem",
                                  fontSize: "0.8125rem",
                                  background: "var(--primary-color)",
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
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.4rem 0.875rem",
                                fontSize: "0.8125rem",
                                background: "#fee2e2",
                                color: "#991b1b",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
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

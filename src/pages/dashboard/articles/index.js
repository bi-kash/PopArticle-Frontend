import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { tenantService } from "@/lib/tenantService";
import { getTenantSlug } from "@/lib/tenantUtils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Globe,
  Building2,
} from "lucide-react";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [filter, tenantFilter, tenants]);

  const loadTenants = async () => {
    try {
      const data = await tenantService.getMyTenants();
      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (data.tenants) arr = data.tenants;
      else if (data.data) arr = data.data;
      setTenants(arr);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.status = filter;

      if (tenantFilter !== "all") {
        params.tenant_id = tenantFilter;
        const data = await articleService.getArticles(params);
        setArticles(
          (data.articles || []).map((a) => ({
            ...a,
            _tenant_id: tenantFilter,
          })),
        );
      } else if (tenants.length > 0) {
        // Load from all tenants
        const all = await Promise.all(
          tenants.map(async (t) => {
            try {
              const data = await articleService.getArticles({
                ...params,
                tenant_id: t.id,
              });
              return (data.articles || []).map((a) => ({
                ...a,
                _tenant_id: t.id,
                _tenant_name: t.name,
                _tenant_slug: getTenantSlug(t),
              }));
            } catch {
              return [];
            }
          }),
        );
        setArticles(
          all
            .flat()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        );
      } else {
        const data = await articleService.getArticles(params);
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (article) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const tenantId = article._tenant_id || article.tenant_id || null;
      await articleService.deleteArticle(article.id, tenantId);
      setArticles(articles.filter((a) => a.id !== article.id));
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadArticles();
      return;
    }

    try {
      setLoading(true);
      const data = await articleService.searchArticles(searchQuery);
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTenantName = (article) => {
    if (article._tenant_name) return article._tenant_name;
    const t = tenants.find(
      (t) => t.id === article._tenant_id || t.id === article.tenant_id,
    );
    return t?.name || "";
  };

  const getTenantSlugForArticle = (article) => {
    if (article._tenant_slug) return article._tenant_slug;
    const t = tenants.find(
      (t) => t.id === article._tenant_id || t.id === article.tenant_id,
    );
    return t ? getTenantSlug(t) : "";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileText size={24} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Articles
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Create, edit, and manage your content
                </p>
              </div>
            </div>
            <Link href="/dashboard/articles/new">
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <Plus size={20} />
                New Article
              </button>
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "end",
              }}
            >
              {/* Search */}
              <form
                onSubmit={handleSearch}
                style={{ flex: 1, minWidth: "300px" }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Search Articles</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Search by title or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Filter */}
              <div
                className="form-group"
                style={{ marginBottom: 0, minWidth: "200px" }}
              >
                <label className="label">Filter by Status</label>
                <select
                  className="select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Articles</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tenant Filter */}
              {tenants.length > 0 && (
                <div
                  className="form-group"
                  style={{ marginBottom: 0, minWidth: "200px" }}
                >
                  <label className="label">Filter by Tenant</label>
                  <select
                    className="select"
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                  >
                    <option value="all">All Tenants</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Articles List */}
          <div className="card">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : articles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  No articles found
                </p>
                <Link href="/dashboard/articles/new">
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={20} />
                    Create your first article
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tenant</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={`${article._tenant_id || ""}-${article.id}`}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{article.title}</div>
                          {article.excerpt && (
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-secondary)",
                                marginTop: "0.25rem",
                              }}
                            >
                              {article.excerpt.substring(0, 80)}...
                            </div>
                          )}
                        </td>
                        <td>
                          {getTenantName(article) ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontSize: "0.8rem",
                                color: "#6366f1",
                                fontWeight: 500,
                              }}
                            >
                              <Globe size={13} />
                              {getTenantName(article)}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontStyle: "italic",
                                fontSize: "0.8rem",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
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
                        <td>
                          {article.category?.name || article.category || (
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontStyle: "italic",
                              }}
                            >
                              No category
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {new Date(article.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link
                              href={
                                getTenantSlugForArticle(article)
                                  ? `/dashboard/tenants/${getTenantSlugForArticle(article)}/articles/${article.id}`
                                  : `/dashboard/articles/${article.id}`
                              }
                            >
                              <button
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "0.35rem 0.6rem",
                                  background:
                                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "0.375rem",
                                  cursor: "pointer",
                                }}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            </Link>
                            <button
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "0.35rem 0.6rem",
                                background: "#fee2e2",
                                color: "#991b1b",
                                border: "none",
                                borderRadius: "0.375rem",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDelete(article)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
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

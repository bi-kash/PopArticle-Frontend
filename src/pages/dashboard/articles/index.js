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
  Upload,
} from "lucide-react";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    setPage(1);
    loadArticles(1);
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

  const loadArticles = async (pageNum = page) => {
    try {
      setLoading(true);
      const offset = (pageNum - 1) * PAGE_SIZE;
      const params = { limit: PAGE_SIZE, offset };
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
        setTotalArticles(data.total ?? (data.articles || []).length);
      } else if (tenants.length > 0) {
        // Load from all tenants in parallel with same page offset
        const all = await Promise.all(
          tenants.map(async (t) => {
            try {
              const data = await articleService.getArticles({
                ...params,
                tenant_id: t.id,
              });
              return {
                articles: (data.articles || []).map((a) => ({
                  ...a,
                  _tenant_id: t.id,
                  _tenant_name: t.name,
                  _tenant_slug: getTenantSlug(t),
                })),
                total: data.total ?? (data.articles || []).length,
              };
            } catch {
              return { articles: [], total: 0 };
            }
          }),
        );
        const combined = all
          .flatMap((r) => r.articles)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const combinedTotal = all.reduce((sum, r) => sum + r.total, 0);
        setArticles(combined);
        setTotalArticles(combinedTotal);
      } else {
        const data = await articleService.getArticles(params);
        setArticles(data.articles || []);
        setTotalArticles(data.total ?? (data.articles || []).length);
      }
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (article) => {
    if (!confirm("Publish this article now?")) return;
    try {
      const tenantId = article._tenant_id || article.tenant_id || null;
      await articleService.publishArticle(article.id, tenantId);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id && a._tenant_id === article._tenant_id
            ? { ...a, status: "published" }
            : a,
        ),
      );
    } catch (error) {
      alert("Failed to publish article");
    }
  };

  const handleDelete = async (article) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const tenantId = article._tenant_id || article.tenant_id || null;
      await articleService.deleteArticle(article.id, tenantId);
      const newTotal = totalArticles - 1;
      setTotalArticles(Math.max(0, newTotal));
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      loadArticles(Math.min(page, maxPage));
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setPage(1);
      loadArticles(1);
      return;
    }

    try {
      setLoading(true);
      const data = await articleService.searchArticles(searchQuery);
      setArticles(data.articles || []);
      setTotalArticles(data.total ?? (data.articles || []).length);
      setPage(1);
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
                  {totalArticles > 0 && (
                    <span
                      style={{
                        marginLeft: "0.75rem",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                      }}
                    >
                      ({totalArticles} total)
                    </span>
                  )}
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
                            {article.status !== "published" && (
                              <button
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.35rem 0.6rem",
                                  background: "#d1fae5",
                                  color: "#065f46",
                                  border: "none",
                                  borderRadius: "0.375rem",
                                  cursor: "pointer",
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                }}
                                onClick={() => handlePublish(article)}
                                title="Publish"
                              >
                                <Upload size={14} />
                                Publish
                              </button>
                            )}
                            <Link
                              href={
                                getTenantSlugForArticle(article)
                                  ? `/dashboard/tenants/${getTenantSlugForArticle(article)}/articles/${article.id}?from=/dashboard/articles`
                                  : `/dashboard/articles/${article.id}?from=/dashboard/articles`
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

          {/* Pagination */}
          {totalArticles > PAGE_SIZE && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1.5rem",
                padding: "1rem",
                background: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, totalArticles)} of {totalArticles}{" "}
                articles
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => loadArticles(page - 1)}
                  style={{
                    padding: "0.5rem 1rem",
                    background:
                      page <= 1
                        ? "var(--surface-secondary)"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: page <= 1 ? "var(--text-secondary)" : "white",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  ← Previous
                </button>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Page {page} of {Math.ceil(totalArticles / PAGE_SIZE)}
                </span>
                <button
                  disabled={
                    page >= Math.ceil(totalArticles / PAGE_SIZE) || loading
                  }
                  onClick={() => loadArticles(page + 1)}
                  style={{
                    padding: "0.5rem 1rem",
                    background:
                      page >= Math.ceil(totalArticles / PAGE_SIZE)
                        ? "var(--surface-secondary)"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color:
                      page >= Math.ceil(totalArticles / PAGE_SIZE)
                        ? "var(--text-secondary)"
                        : "white",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    cursor:
                      page >= Math.ceil(totalArticles / PAGE_SIZE)
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

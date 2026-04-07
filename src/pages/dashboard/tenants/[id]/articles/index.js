import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { tenantService } from "@/lib/tenantService";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  ArrowLeft,
  Search,
  Upload,
} from "lucide-react";

const PAGE_SIZE = 50;

export default function TenantArticles() {
  const router = useRouter();
  const { id } = router.query;
  const { tenantId: resolvedId } = useTenantBySlug();
  const [tenant, setTenant] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    if (resolvedId) {
      loadData(1);
    }
  }, [resolvedId]);

  const loadData = async (pageNum = page) => {
    try {
      setLoading(true);
      const offset = (pageNum - 1) * PAGE_SIZE;
      const [tenantData, articlesData] = await Promise.all([
        tenantService.getTenant(resolvedId || id),
        articleService.getArticles({
          tenant_id: resolvedId || id,
          limit: PAGE_SIZE,
          offset,
        }),
      ]);
      setTenant(tenantData.tenant || tenantData);

      const allArticles = articlesData.articles || [];
      setArticles(allArticles);
      setTotalArticles(articlesData.total ?? allArticles.length);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (articleId) => {
    if (!confirm("Publish this article now?")) return;
    try {
      await articleService.publishArticle(articleId, resolvedId || id);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, status: "published" } : a,
        ),
      );
    } catch (error) {
      alert("Failed to publish article");
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await articleService.deleteArticle(articleId, resolvedId || id);
      setTotalArticles((prev) => Math.max(0, prev - 1));
      // Go to previous page if deleting the last item on this page
      const newTotal = totalArticles - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      loadData(Math.min(page, maxPage));
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() => router.push(`/dashboard/tenants/${id}/dashboard`)}
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
              Back to {tenant?.name} Dashboard
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
                  <FileText size={24} />
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
                      fontSize: "0.9375rem",
                    }}
                  >
                    {tenant?.name} &mdash; {tenant?.primary_domain}
                  </p>
                </div>
              </div>
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
            </div>
          </div>

          {/* Search */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                type="text"
                className="input"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "3rem" }}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "3rem" }}
            >
              <FileText
                size={64}
                style={{
                  color: "var(--text-secondary)",
                  margin: "0 auto 1.5rem",
                }}
              />
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {searchTerm ? "No matching articles" : "No Articles Yet"}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                }}
              >
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first article for this tenant"}
              </p>
              {!searchTerm && (
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
              )}
            </div>
          ) : (
            <div className="card">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{ borderBottom: "2px solid var(--border-color)" }}
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
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <td
                          style={{
                            padding: "1rem",
                            fontWeight: 500,
                            maxWidth: "300px",
                          }}
                        >
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
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              justifyContent: "flex-end",
                            }}
                          >
                            {article.status !== "published" && (
                              <button
                                onClick={() => handlePublish(article.id)}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  background: "#d1fae5",
                                  color: "#065f46",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                }}
                                title="Publish"
                              >
                                <Upload size={14} />
                                Publish
                              </button>
                            )}
                            <Link
                              href={`/dashboard/tenants/${id}/articles/${article.id}`}
                            >
                              <button
                                style={{
                                  padding: "0.5rem",
                                  background:
                                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                            </Link>
                            <button
                              className="btn"
                              onClick={() => handleDelete(article.id)}
                              style={{
                                padding: "0.5rem",
                                background: "transparent",
                                color: "var(--danger-color)",
                                border: "none",
                              }}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                  onClick={() => loadData(page - 1)}
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
                  onClick={() => loadData(page + 1)}
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

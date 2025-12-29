import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
} from "lucide-react";

export default function TenantArticles() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, articlesData] = await Promise.all([
        tenantService.getTenant(id),
        articleService.getArticles({ tenant_id: id }),
      ]);
      setTenant(tenantData.tenant || tenantData);

      // Backend filters by X-Tenant-ID header, so we get only tenant's articles
      const allArticles = articlesData.articles || [];
      setArticles(allArticles);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await articleService.deleteArticle(articleId, id);
      loadData();
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => router.push(`/dashboard/tenants/${id}/dashboard`)}
              style={{ marginBottom: "1rem" }}
            >
              <ArrowLeft size={20} />
              Back to {tenant?.name} Dashboard
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Articles - {tenant?.name}
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  Manage articles for {tenant?.primary_domain}
                </p>
              </div>
              <Link href={`/dashboard/tenants/${id}/articles/new`}>
                <button className="btn btn-primary">
                  <Plus size={20} />
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
                  <button className="btn btn-primary">
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
                        Type
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
                                  ? "var(--success-color)"
                                  : article.status === "draft"
                                  ? "var(--warning-color)"
                                  : "var(--surface)",
                              color:
                                article.status === "published" ||
                                article.status === "draft"
                                  ? "white"
                                  : "var(--text-primary)",
                            }}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            color: "var(--text-secondary)",
                            textTransform: "capitalize",
                          }}
                        >
                          {article.content_type || "html"}
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
                            <Link
                              href={`/dashboard/tenants/${id}/articles/${article.id}`}
                            >
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "0.5rem" }}
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

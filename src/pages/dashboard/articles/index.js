import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") {
        params.status = filter;
      }
      const data = await articleService.getArticles(params);
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await articleService.deleteArticle(id);
      setArticles(articles.filter((a) => a.id !== id));
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
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Articles</h1>
            <Link href="/dashboard/articles/new">
              <button className="btn btn-primary">
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
                    <button type="submit" className="btn btn-primary">
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
                  <button className="btn btn-primary">
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
                      <th>Status</th>
                      <th>Category</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id}>
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
                            <Link href={`/dashboard/articles/${article.id}`}>
                              <button
                                className="btn btn-primary"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.875rem",
                                }}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            </Link>
                            <button
                              className="btn btn-danger"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.875rem",
                              }}
                              onClick={() => handleDelete(article.id)}
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

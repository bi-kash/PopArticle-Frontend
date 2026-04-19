import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import CommentsSection from "@/components/CommentsSection";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import {
  Save,
  Trash2,
  Eye,
  Edit3,
  Maximize2,
  X,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function EditArticle() {
  const router = useRouter();
  const { id, from } = router.query;
  const backPath = from || "/dashboard/articles";
  const [formData, setFormData] = useState(null);
  const [viewMode, setViewMode] = useState("edit"); // 'edit' or 'preview'
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (id) {
      loadArticle();
      loadCategories();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await articleService.getArticle(id);
      setFormData({
        title: data.article.title || "",
        content: data.article.content || "",
        excerpt: data.article.excerpt || "",
        category_id: data.article.category_id || "",
        status: data.article.status || "draft",
        published_at: data.article.published_at || "",
        meta_title: data.article.meta_title || "",
        meta_description: data.article.meta_description || "",
        keywords: data.article.keywords || [],
      });
    } catch (error) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        ...formData,
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : null,
        published_at: formData.published_at || null,
      };

      await articleService.updateArticle(id, data);
      router.push(backPath);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await articleService.deleteArticle(id);
      router.push(backPath);
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
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

  if (!formData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="alert alert-error">Article not found</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
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
            <div>
              <button
                type="button"
                onClick={() => router.push(backPath)}
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
                Back to Articles
              </button>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                Edit Article
              </h1>
            </div>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={20} />
              Delete
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                Basic Information
              </h2>

              <div className="form-group">
                <label className="label">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Excerpt</label>
                <textarea
                  className="textarea"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Publishing */}
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label
                  className="label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Calendar size={16} style={{ color: "#6366f1" }} />
                  {formData.status === "published"
                    ? "Publish Date"
                    : "Scheduled Publish Date"}
                </label>
                {formData.status !== "published" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <input
                      type="datetime-local"
                      className="input"
                      value={
                        formData.published_at
                          ? new Date(
                              new Date(formData.published_at).getTime() -
                                new Date(
                                  formData.published_at,
                                ).getTimezoneOffset() *
                                  60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        })
                      }
                      style={{ flex: 1, maxWidth: "320px" }}
                    />
                    {formData.published_at && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, published_at: "" })
                        }
                        style={{
                          padding: "0.5rem 0.75rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
                <div style={{ marginTop: "0.5rem" }}>
                  {formData.published_at ? (
                    (() => {
                      const pubDate = new Date(formData.published_at);
                      const now = new Date();
                      const isFuture = pubDate > now;
                      const isPublished = formData.status === "published";

                      // Calculate relative time
                      let relativeText = "";
                      if (isFuture && !isPublished) {
                        const diffMs = pubDate - now;
                        const diffDays = Math.floor(
                          diffMs / (1000 * 60 * 60 * 24),
                        );
                        const diffHours = Math.floor(
                          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                        );
                        const diffMinutes = Math.floor(
                          (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                        );
                        const parts = [];
                        if (diffDays > 0)
                          parts.push(
                            `${diffDays} day${diffDays !== 1 ? "s" : ""}`,
                          );
                        if (diffHours > 0)
                          parts.push(
                            `${diffHours} hour${diffHours !== 1 ? "s" : ""}`,
                          );
                        if (diffMinutes > 0 && diffDays === 0)
                          parts.push(
                            `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""}`,
                          );
                        if (parts.length > 0)
                          relativeText = ` (in ${parts.join(", ")})`;
                      }

                      const dateStr = pubDate.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      });

                      return (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.3rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            background: isPublished
                              ? "#d1fae5"
                              : isFuture
                                ? "#ede9fe"
                                : "#d1fae5",
                            color: isPublished
                              ? "#065f46"
                              : isFuture
                                ? "#5b21b6"
                                : "#065f46",
                          }}
                        >
                          <Calendar size={13} />
                          {isPublished
                            ? "Published on "
                            : isFuture
                              ? "Will be published on "
                              : "Published on "}
                          {dateStr}
                          {relativeText}
                        </span>
                      );
                    })()
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        background: "#f3f4f6",
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      <Calendar size={13} />
                      No scheduled date set
                    </span>
                  )}
                </div>
                {formData.status !== "published" && (
                  <small
                    style={{
                      color: "var(--text-secondary)",
                      display: "block",
                      marginTop: "0.375rem",
                    }}
                  >
                    Set a future date to automatically publish the article.
                    Leave empty for manual publishing.
                  </small>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                  Content * (Markdown)
                </h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "edit" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setViewMode("edit")}
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "preview" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setViewMode("preview")}
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setFullscreenPreview(true)}
                    title="Full Page Preview"
                  >
                    <Maximize2 size={16} />
                    Full Preview
                  </button>
                </div>
              </div>

              {viewMode === "edit" ? (
                <textarea
                  className="textarea"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={20}
                  placeholder="Write your article content in Markdown..."
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                  required
                />
              ) : (
                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    padding: "1.5rem",
                    minHeight: "400px",
                    background: "white",
                  }}
                  className="markdown-preview"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.content ||
                      "*No content yet. Switch to Edit mode to write your article.*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="card" style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                SEO Settings
              </h2>

              <div className="form-group">
                <label className="label">Meta Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">Meta Description</label>
                <textarea
                  className="textarea"
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meta_description: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="label">Keywords</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    className="input"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddKeyword())
                    }
                    placeholder="Add keyword"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddKeyword}
                  >
                    Add
                  </button>
                </div>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="badge badge-info"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      {keyword} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <Save size={20} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push(backPath)}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Comments Section */}
          {id && <CommentsSection articleId={id} />}
        </div>

        {/* Fullscreen Preview Modal */}
        {fullscreenPreview && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "white",
              zIndex: 9999,
              overflow: "auto",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                borderBottom: "1px solid var(--border-color)",
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                Article Preview
              </h2>
              <button
                className="btn btn-secondary"
                onClick={() => setFullscreenPreview(false)}
              >
                <X size={20} />
                Close Preview
              </button>
            </div>
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "3rem 2rem",
              }}
            >
              <article>
                <header style={{ marginBottom: "2rem" }}>
                  <h1
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      lineHeight: "1.2",
                    }}
                  >
                    {formData.title}
                  </h1>
                  {formData.excerpt && (
                    <p
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--text-secondary)",
                        marginBottom: "1rem",
                      }}
                    >
                      {formData.excerpt}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span
                      className={`badge badge-${
                        formData.status === "published"
                          ? "success"
                          : formData.status === "draft"
                            ? "warning"
                            : "info"
                      }`}
                    >
                      {formData.status}
                    </span>
                    {formData.category_id && (
                      <span>
                        Category:{" "}
                        {categories.find(
                          (c) => c.id === parseInt(formData.category_id),
                        )?.name || "N/A"}
                      </span>
                    )}
                  </div>
                </header>
                <div
                  className="markdown-preview"
                  style={{
                    fontSize: "1.125rem",
                    lineHeight: "1.8",
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.content || "*No content available*"}
                  </ReactMarkdown>
                </div>
              </article>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

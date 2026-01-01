import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import CommentsSection from "@/components/CommentsSection";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import { Save, Trash2, Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function EditArticle() {
  const router = useRouter();
  const { id: tenantId, articleId } = router.query;
  const [formData, setFormData] = useState(null);
  const [viewMode, setViewMode] = useState("edit"); // "edit" or "preview"
  const [categories, setCategories] = useState([]);
  const [articleData, setArticleData] = useState(null); // Store raw article data
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (articleId && tenantId) {
      loadData();
    }
  }, [articleId, tenantId]);

  // When both article and categories are loaded, process the form data
  useEffect(() => {
    if (articleData && categories.length > 0) {
      processArticleData();
    }
  }, [articleData, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articleResponse, categoriesResponse] = await Promise.all([
        articleService.getArticle(articleId, tenantId),
        categoryService.getCategories({ tenant_id: tenantId }),
      ]);

      console.log("Article data:", articleResponse.article);
      console.log("Categories:", categoriesResponse.categories);

      setArticleData(articleResponse.article);
      setCategories(categoriesResponse.categories || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load article");
      setLoading(false);
    }
  };

  const processArticleData = () => {
    if (!articleData) return;

    // Handle category - can be:
    // 1. category_id (number)
    // 2. category: { id, name } (object)
    // 3. category: "Technology" (string name)
    let categoryId = "";

    if (articleData.category_id) {
      categoryId = String(articleData.category_id);
    } else if (articleData.category) {
      if (typeof articleData.category === "object" && articleData.category.id) {
        // Category is an object with id
        categoryId = String(articleData.category.id);
      } else if (typeof articleData.category === "string") {
        // Category is a string name - find matching category
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase() === articleData.category.toLowerCase()
        );
        if (matchedCategory) {
          categoryId = String(matchedCategory.id);
        }
      }
    }

    console.log("Final category_id:", categoryId);

    // Handle SEO nested object
    const metaTitle =
      articleData.seo?.meta_title || articleData.meta_title || "";
    const metaDescription =
      articleData.seo?.meta_description || articleData.meta_description || "";

    setFormData({
      title: articleData.title || "",
      content: articleData.content || "",
      excerpt: articleData.excerpt || "",
      category_id: categoryId,
      status: articleData.status || "draft",
      is_featured: articleData.is_featured || false,
      meta_title: metaTitle,
      meta_description: metaDescription,
      keywords: articleData.keywords || [],
    });

    setLoading(false);
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
        is_featured: Boolean(formData.is_featured),
      };

      await articleService.updateArticle(articleId, data, tenantId);
      router.push(`/dashboard/tenants/${tenantId}/articles`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update article"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await articleService.deleteArticle(articleId, tenantId);
      router.push(`/dashboard/tenants/${tenantId}/articles`);
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
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
              Edit Article
            </h1>
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

                <div className="form-group">
                  <label
                    className="label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      style={{ width: "auto", cursor: "pointer" }}
                    />
                    <span>Featured Article</span>
                  </label>
                  <small
                    style={{
                      color: "var(--text-secondary)",
                      display: "block",
                      marginTop: "0.25rem",
                    }}
                  >
                    Featured articles appear in special sections and highlights
                  </small>
                </div>
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
                  Content *
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
                  <ReactMarkdown>
                    {formData.content || "*No content yet*"}
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
                onClick={() => router.push("/dashboard/articles")}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Comments Section */}
          {articleId && <CommentsSection articleId={articleId} />}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

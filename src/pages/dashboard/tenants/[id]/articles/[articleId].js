import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import { Save, Trash2 } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function EditArticle() {
  const router = useRouter();
  const { id: tenantId, articleId } = router.query;
  const [formData, setFormData] = useState(null);
  const [editorType, setEditorType] = useState("markdown");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (articleId && tenantId) {
      loadArticle();
      loadCategories();
    }
  }, [articleId, tenantId]);

  const loadArticle = async () => {
    try {
      const data = await articleService.getArticle(articleId);

      // Handle both category_id (number) and category (object with id)
      let categoryId = data.article.category_id;
      if (!categoryId && data.article.category) {
        categoryId = data.article.category.id;
      }

      setFormData({
        title: data.article.title || "",
        content: data.article.content || "",
        excerpt: data.article.excerpt || "",
        category_id: categoryId ? String(categoryId) : "",
        status: data.article.status || "draft",
        is_featured: data.article.is_featured || false,
        meta_title: data.article.meta_title || "",
        meta_description: data.article.meta_description || "",
        keywords: data.article.keywords || [],
      });

      // Detect editor type from content
      if (
        data.article.content?.includes("<") &&
        data.article.content?.includes(">")
      ) {
        setEditorType("html");
      }
    } catch (error) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories({ tenant_id: tenantId });
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
        is_featured: Boolean(formData.is_featured),
      };

      await articleService.updateArticle(articleId, data);
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
      await articleService.deleteArticle(articleId);
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
                      editorType === "markdown"
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    onClick={() => setEditorType("markdown")}
                  >
                    Markdown
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      editorType === "html" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setEditorType("html")}
                  >
                    HTML
                  </button>
                </div>
              </div>

              {editorType === "markdown" ? (
                <SimpleMDE
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  options={{
                    spellChecker: false,
                    status: false,
                    autofocus: false,
                  }}
                />
              ) : (
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  modules={quillModules}
                />
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

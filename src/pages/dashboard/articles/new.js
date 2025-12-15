import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import { Save, Eye } from "lucide-react";

// Dynamic imports for editors to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function NewArticle() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category_id: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    keywords: [],
  });
  const [editorType, setEditorType] = useState("markdown"); // 'html' or 'markdown'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

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
    setLoading(true);

    try {
      const data = {
        ...formData,
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : null,
      };

      const response = await articleService.createArticle(data);
      router.push(`/dashboard/articles/${response.article.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create article");
    } finally {
      setLoading(false);
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
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "2rem",
            }}
          >
            Create New Article
          </h1>

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
                  placeholder="Enter article title"
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
                  placeholder="Brief description of the article"
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
                  </select>
                </div>
              </div>
            </div>

            {/* Content Editor */}
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
                    placeholder: "Write your article content in Markdown...",
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
                  placeholder="Write your article content..."
                />
              )}
            </div>

            {/* SEO Settings */}
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
                  placeholder="SEO title for search engines"
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
                  placeholder="SEO description for search engines"
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
                    placeholder="Add keyword and press Enter"
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

            {/* Submit */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Article"}
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

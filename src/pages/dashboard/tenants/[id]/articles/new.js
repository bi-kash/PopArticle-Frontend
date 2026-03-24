import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import { Save, Eye, Edit3, ArrowLeft, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NewArticle() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    category_id: "",
    status: "draft",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    keywords: [],
    tenant_id: "",
  });
  const [viewMode, setViewMode] = useState("edit"); // 'edit' or 'preview'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    // Load categories for the current tenant when `tenantId` is available.
    // If tenantId is not yet present, call without tenant header so global
    // categories may still appear.
    if (tenantId) {
      loadCategories(tenantId);
      setFormData((prev) => ({ ...prev, tenant_id: tenantId }));
    } else {
      loadCategories();
    }
  }, [tenantId]);

  const loadCategories = async (tenant = null) => {
    try {
      const params = tenant ? { tenant_id: tenant } : {};
      const data = await categoryService.getCategories(params);
      // API may return categories under different keys depending on endpoint
      const cats = data.categories || data.data || data || [];
      console.debug("Loaded categories:", cats);
      setCategories(cats || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Prepare form data - use FormData if there's a file, otherwise JSON
      let dataToSend;
      let isFormData = false;

      if (imageFile) {
        // Use FormData for file upload
        dataToSend = new FormData();
        dataToSend.append("title", formData.title);
        dataToSend.append("content", formData.content);
        if (formData.excerpt) dataToSend.append("excerpt", formData.excerpt);
        if (formData.category_id)
          dataToSend.append("category_id", parseInt(formData.category_id));
        dataToSend.append("status", formData.status);
        dataToSend.append("is_featured", Boolean(formData.is_featured));
        if (formData.meta_title)
          dataToSend.append("meta_title", formData.meta_title);
        if (formData.meta_description)
          dataToSend.append("meta_description", formData.meta_description);
        if (formData.keywords.length > 0)
          dataToSend.append("keywords", JSON.stringify(formData.keywords));
        dataToSend.append("image", imageFile);
        isFormData = true;
      } else {
        // Use JSON for URL or no image
        dataToSend = {
          ...formData,
          category_id: formData.category_id
            ? parseInt(formData.category_id)
            : null,
          is_featured: Boolean(formData.is_featured),
          tenant_id: tenantId,
        };
      }

      console.log(
        "Creating article with data:",
        isFormData ? "FormData" : dataToSend,
      );
      const response = await articleService.createArticle(
        dataToSend,
        tenantId,
        isFormData,
      );
      console.log("API Response:", response);

      // Check if article was created successfully
      // Handle both response.article.id and response.id
      const articleId = response?.article?.id || response?.id;

      if (articleId) {
        // Successfully created
        setSuccess("Article created successfully! Redirecting...");
        console.log("Navigating to article:", articleId);

        // Wait a moment to show success message before navigating
        setTimeout(async () => {
          await router.push(
            `/dashboard/tenants/${tenantId}/articles/${articleId}`,
          );
        }, 500);
      } else {
        // Log the full response for debugging
        console.error("Unexpected response structure:", response);
        throw new Error(
          "Article created but unable to retrieve article ID from response",
        );
      }
    } catch (err) {
      console.error("Article creation error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create article",
      );
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Clear image URL if file is selected
      setFormData({ ...formData, image: "" });
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
    // Clear file if URL is provided
    setImageFile(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() =>
                router.push(`/dashboard/tenants/${tenantId}/articles`)
              }
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
                  color: "white",
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginBottom: "0.25rem",
                  }}
                >
                  Create New Article
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9375rem",
                  }}
                >
                  Write and publish content for your website
                </p>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

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

              {/* Image Upload Section */}
              <div className="form-group">
                <label className="label">Article Image</label>

                {/* Image Preview */}
                {imagePreview && (
                  <div style={{ marginBottom: "1rem", position: "relative" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "0.375rem",
                        border: "1px solid var(--border-color)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger"
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* File Upload */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <label
                    className="label"
                    style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
                  >
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="input"
                    style={{ padding: "0.5rem" }}
                  />
                </div>

                {/* OR */}
                <div
                  style={{
                    textAlign: "center",
                    margin: "0.5rem 0",
                    color: "var(--text-secondary)",
                  }}
                >
                  OR
                </div>

                {/* Image URL */}
                <div>
                  <label
                    className="label"
                    style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
                  >
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <small
                  style={{
                    color: "var(--text-secondary)",
                    display: "block",
                    marginTop: "0.5rem",
                  }}
                >
                  Upload an image file or provide an image URL
                </small>
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
                  Content * (Markdown)
                </h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.5rem 1rem",
                      background:
                        viewMode === "edit"
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "var(--surface)",
                      color:
                        viewMode === "edit" ? "white" : "var(--text-secondary)",
                      border:
                        viewMode === "edit"
                          ? "none"
                          : "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                    onClick={() => setViewMode("edit")}
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.5rem 1rem",
                      background:
                        viewMode === "preview"
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "var(--surface)",
                      color:
                        viewMode === "preview"
                          ? "white"
                          : "var(--text-secondary)",
                      border:
                        viewMode === "preview"
                          ? "none"
                          : "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
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
                disabled={loading}
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
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Article"}
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/tenants/${tenantId}/articles`)
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
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

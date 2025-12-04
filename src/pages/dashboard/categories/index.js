import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { categoryService } from "@/lib/categoryService";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }

      setFormData({ name: "", description: "" });
      setShowForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setError("");
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
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Categories</h1>
            {!showForm && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} />
                New Category
              </button>
            )}
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Category name"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Category description"
                    rows="3"
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCategory
                      ? "Update"
                      : "Create"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <FolderTree
                  size={48}
                  style={{
                    color: "var(--text-secondary)",
                    margin: "0 auto 1rem",
                  }}
                />
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  No categories yet
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create your first category
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Articles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={{ fontWeight: 500 }}>{category.name}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {category.description || "-"}
                      </td>
                      <td>{category.article_count || 0}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.875rem",
                            }}
                            onClick={() => handleEdit(category)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.875rem",
                            }}
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

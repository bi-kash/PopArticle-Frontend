import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { categoryService } from "@/lib/categoryService";
import { tenantService } from "@/lib/tenantService";
import { Plus, Edit, Trash2, FolderTree, Globe } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantFilter, setTenantFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [tenantFilter, tenants]);

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

  const loadCategories = async () => {
    try {
      setLoading(true);
      if (tenantFilter !== "all") {
        const data = await categoryService.getCategories({
          tenant_id: tenantFilter,
        });
        setCategories(
          (data.categories || []).map((c) => ({
            ...c,
            _tenant_id: tenantFilter,
          })),
        );
      } else if (tenants.length > 0) {
        const all = await Promise.all(
          tenants.map(async (t) => {
            try {
              const data = await categoryService.getCategories({
                tenant_id: t.id,
              });
              return (data.categories || []).map((c) => ({
                ...c,
                _tenant_id: t.id,
                _tenant_name: t.name,
              }));
            } catch {
              return [];
            }
          }),
        );
        setCategories(all.flat());
      } else {
        const data = await categoryService.getCategories();
        setCategories(data.categories || []);
      }
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
                <FolderTree size={24} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Categories
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Organize your articles by topic
                </p>
              </div>
            </div>
            {!showForm && (
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
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} />
                New Category
              </button>
            )}
          </div>

          {/* Tenant Filter */}
          {tenants.length > 0 && (
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                Filter by Tenant:
              </label>
              <select
                className="select"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                style={{ maxWidth: "250px" }}
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
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      background: saving
                        ? "#a5b4fc"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
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
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.625rem 1.25rem",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
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
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={20} />
                  Create your first category
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Tenant</th>
                    <th>Description</th>
                    <th>Articles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const tName =
                      category._tenant_name ||
                      tenants.find(
                        (t) =>
                          t.id === category._tenant_id ||
                          t.id === category.tenant_id,
                      )?.name ||
                      "";
                    return (
                      <tr key={`${category._tenant_id || ""}-${category.id}`}>
                        <td style={{ fontWeight: 500 }}>{category.name}</td>
                        <td>
                          {tName ? (
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
                              {tName}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {category.description || "-"}
                        </td>
                        <td>{category.article_count || 0}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
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
                              onClick={() => handleEdit(category)}
                            >
                              <Edit size={16} />
                            </button>
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
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

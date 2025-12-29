import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { categoryService } from "@/lib/categoryService";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

export default function TenantCategories() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const [tenant, setTenant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteAction, setDeleteAction] = useState("reassign");
  const [reassignCategoryId, setReassignCategoryId] = useState("");

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, categoriesData] = await Promise.all([
        tenantService.getTenant(tenantId),
        categoryService.getCategories({ tenant_id: tenantId }),
      ]);
      setTenant(tenantData.tenant || tenantData);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await categoryService.createCategory(
        {
          name: newCategoryName.trim(),
          tenant_id: tenantId,
        },
        tenantId
      );
      setNewCategoryName("");
      setShowAddForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !editingCategory) return;

    try {
      await categoryService.updateCategory(
        editingCategory.id,
        {
          name: newCategoryName.trim(),
        },
        tenantId
      );
      setNewCategoryName("");
      setEditingCategory(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteModal(category);
    setDeleteAction("reassign");
    setReassignCategoryId("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    try {
      const params = {
        action: deleteAction,
      };

      if (deleteAction === "reassign" && reassignCategoryId) {
        params.reassign_to = reassignCategoryId;
      }

      await categoryService.deleteCategory(deleteModal.id, params, tenantId);
      setDeleteModal(null);
      setReassignCategoryId("");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName("");
  };

  const availableCategories = categories.filter(
    (cat) => cat.id !== deleteModal?.id
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() =>
                router.push(`/dashboard/tenants/${tenantId}/dashboard`)
              }
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
                  Categories - {tenant?.name}
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  Organize your articles with categories
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingCategory(null);
                  setNewCategoryName("");
                }}
              >
                <Plus size={20} />
                New Category
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingCategory) && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <form
                onSubmit={
                  editingCategory ? handleUpdateCategory : handleAddCategory
                }
              >
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "end",
                  }}
                >
                  <div
                    className="form-group"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <label className="label">Category Name</label>
                    <input
                      type="text"
                      className="input"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                      placeholder="e.g., Technology, News, Blog"
                      autoFocus
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddForm(false);
                        cancelEdit();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : categories.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "3rem" }}
            >
              <FolderTree
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
                No Categories Yet
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                }}
              >
                Create categories to organize your articles
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={20} />
                Create First Category
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {categories.map((category) => (
                <div key={category.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          background: "var(--primary-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <FolderTree size={20} />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                          }}
                        >
                          {category.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {category.article_count || 0} articles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={() => startEdit(category)}
                      style={{ flex: 1 }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDeleteClick(category)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        color: "var(--danger-color)",
                        border: "1px solid var(--danger-color)",
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
              }}
              onClick={() => setDeleteModal(null)}
            >
              <div
                className="card"
                style={{
                  maxWidth: "500px",
                  width: "90%",
                  margin: "1rem",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <AlertTriangle
                    size={48}
                    style={{ color: "var(--danger-color)" }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      Delete Category
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {deleteModal.name}
                    </p>
                  </div>
                </div>

                <p style={{ marginBottom: "1rem" }}>
                  This category has{" "}
                  <strong>{deleteModal.article_count || 0} articles</strong>.
                  What would you like to do with them?
                </p>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "0.5rem",
                      padding: "1rem",
                      border: "2px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      marginBottom: "0.75rem",
                      cursor: "pointer",
                      background:
                        deleteAction === "reassign"
                          ? "var(--surface)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="deleteAction"
                      value="reassign"
                      checked={deleteAction === "reassign"}
                      onChange={(e) => setDeleteAction(e.target.value)}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>Move articles to another category</strong>
                      {deleteAction === "reassign" && (
                        <select
                          className="select"
                          value={reassignCategoryId}
                          onChange={(e) =>
                            setReassignCategoryId(e.target.value)
                          }
                          style={{ marginTop: "0.5rem", width: "100%" }}
                          required
                        >
                          <option value="">Select a category</option>
                          {availableCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "0.5rem",
                      padding: "1rem",
                      border: "2px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      marginBottom: "0.75rem",
                      cursor: "pointer",
                      background:
                        deleteAction === "uncategorize"
                          ? "var(--surface)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="deleteAction"
                      value="uncategorize"
                      checked={deleteAction === "uncategorize"}
                      onChange={(e) => setDeleteAction(e.target.value)}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div>
                      <strong>Remove category but keep articles</strong>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        Articles will remain without a category
                      </p>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "0.5rem",
                      padding: "1rem",
                      border: "2px solid var(--danger-color)",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      background:
                        deleteAction === "delete_all"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="deleteAction"
                      value="delete_all"
                      checked={deleteAction === "delete_all"}
                      onChange={(e) => setDeleteAction(e.target.value)}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div>
                      <strong style={{ color: "var(--danger-color)" }}>
                        Delete category and all articles
                      </strong>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        ⚠️ This action cannot be undone!
                      </p>
                    </div>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="btn"
                    onClick={handleConfirmDelete}
                    disabled={
                      deleteAction === "reassign" && !reassignCategoryId
                    }
                    style={{
                      flex: 1,
                      background: "var(--danger-color)",
                      color: "white",
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal(null)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

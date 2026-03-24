import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { categoryService } from "@/lib/categoryService";
import { articleService } from "@/lib/articleService";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Hash,
  AlignLeft,
  Tag,
  ChevronRight,
} from "lucide-react";

const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY_FORM = { name: "", slug: "", description: "", slugTouched: false };

export default function TenantCategories() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const [tenant, setTenant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteAction, setDeleteAction] = useState("reassign");
  const [reassignCategoryId, setReassignCategoryId] = useState("");

  useEffect(() => {
    if (tenantId) loadData();
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, categoriesData, articlesData] = await Promise.all([
        tenantService.getTenant(tenantId),
        categoryService.getCategories({ tenant_id: tenantId }),
        articleService
          .getArticles({ tenant_id: tenantId, per_page: 1000 })
          .catch(() => ({ articles: [] })),
      ]);
      setTenant(tenantData.tenant || tenantData);

      // Build accurate article counts from the articles list
      const rawCategories = categoriesData.categories || [];
      const articles = articlesData.articles || articlesData.data || [];
      const countMap = {};
      articles.forEach((a) => {
        const cid = a.category_id;
        if (cid != null) countMap[cid] = (countMap[cid] || 0) + 1;
      });

      const categoriesWithCounts = rawCategories.map((cat) => ({
        ...cat,
        article_count:
          countMap[cat.id] ?? cat.article_count ?? cat.articles_count ?? 0,
      }));
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !prev.slugTouched) {
        next.slug = toSlug(value);
      }
      if (field === "slug") {
        next.slugTouched = value !== "";
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setFormError("");
    try {
      await categoryService.createCategory(
        {
          name: form.name.trim(),
          slug: form.slug.trim() || toSlug(form.name.trim()) || undefined,
          description: form.description.trim() || undefined,
          tenant_id: tenantId,
        },
        tenantId,
      );
      resetForm();
      setShowAddForm(false);
      loadData();
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Failed to create category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !editingCategory) return;
    setSubmitting(true);
    setFormError("");
    try {
      await categoryService.updateCategory(
        editingCategory.id,
        {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
        },
        tenantId,
      );
      resetForm();
      setEditingCategory(null);
      loadData();
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Failed to update category",
      );
    } finally {
      setSubmitting(false);
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
      const params = { action: deleteAction };
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
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      slugTouched: true,
    });
    setFormError("");
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setEditingCategory(null);
    setShowAddForm(false);
    resetForm();
  };

  const availableCategories = categories.filter(
    (cat) => cat.id !== deleteModal?.id,
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() =>
                router.push(`/dashboard/tenants/${tenantId}/dashboard`)
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
              Back to {tenant?.name} Dashboard
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
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
                  <FolderTree size={24} />
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: "700",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Categories
                  </h1>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {tenant?.name} &mdash; {categories.length} categor
                    {categories.length === 1 ? "y" : "ies"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingCategory(null);
                  resetForm();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={18} />
                New Category
              </button>
            </div>
          </div>

          {/* Add / Edit Form */}
          {(showAddForm || editingCategory) && (
            <div
              className="card"
              style={{
                marginBottom: "2rem",
                borderTop: "3px solid var(--primary-color)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Tag size={18} style={{ color: "var(--primary-color)" }} />
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>

              <form
                onSubmit={
                  editingCategory ? handleUpdateCategory : handleAddCategory
                }
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {/* Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label
                      className="label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <AlignLeft size={14} />
                      Name{" "}
                      <span style={{ color: "var(--danger-color)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      required
                      placeholder="e.g., Technology, News"
                      autoFocus
                    />
                  </div>

                  {/* Slug */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label
                      className="label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <Hash size={14} />
                      Slug
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginLeft: "0.25rem",
                        }}
                      >
                        (auto-generated)
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={form.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      placeholder="e.g., technology-news"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label
                    className="label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <FileText size={14} />
                    Description
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginLeft: "0.25rem",
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="input"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Brief description of this category..."
                    rows={2}
                    style={{ resize: "vertical", minHeight: "64px" }}
                  />
                </div>

                {formError && (
                  <p
                    style={{
                      color: "var(--danger-color)",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      padding: "0.625rem 0.75rem",
                      background: "rgba(239,68,68,0.08)",
                      borderRadius: "0.375rem",
                    }}
                  >
                    {formError}
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !form.name.trim()}
                  >
                    {submitting
                      ? "Saving…"
                      : editingCategory
                        ? "Save Changes"
                        : "Create Category"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
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
              style={{ textAlign: "center", padding: "4rem 2rem" }}
            >
              <FolderTree
                size={56}
                style={{
                  color: "var(--text-secondary)",
                  margin: "0 auto 1.25rem",
                  opacity: 0.5,
                }}
              />
              <h3
                style={{
                  fontSize: "1.375rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                No Categories Yet
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "1.75rem",
                  maxWidth: "360px",
                  margin: "0 auto 1.75rem",
                }}
              >
                Create categories to organise your articles by topic.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
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
                  cursor: "pointer",
                }}
              >
                <Plus size={18} />
                Create First Category
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  {/* Card top */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.875rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "var(--primary-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      <FolderTree size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "1.0625rem",
                          fontWeight: "600",
                          marginBottom: "0.125rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {category.name}
                      </h3>
                      {category.slug && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            fontFamily: "monospace",
                          }}
                        >
                          /{category.slug}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.75rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.45",
                      }}
                    >
                      {category.description}
                    </p>
                  )}

                  {/* Article count badge */}
                  <div style={{ marginBottom: "1rem", marginTop: "auto" }}>
                    <Link
                      href={`/dashboard/tenants/${tenantId}/articles?category_id=${category.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.8125rem",
                        fontWeight: "500",
                        color:
                          category.article_count > 0
                            ? "var(--primary-color)"
                            : "var(--text-secondary)",
                        background:
                          category.article_count > 0
                            ? "rgba(37,99,235,0.08)"
                            : "var(--surface)",
                        padding: "0.3125rem 0.625rem",
                        borderRadius: "999px",
                        textDecoration: "none",
                      }}
                    >
                      <FileText size={13} />
                      {category.article_count}{" "}
                      {category.article_count === 1 ? "article" : "articles"}
                      {category.article_count > 0 && <ChevronRight size={12} />}
                    </Link>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      paddingTop: "0.875rem",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <button
                      onClick={() => startEdit(category)}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.75rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Edit size={15} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.75rem",
                        background: "transparent",
                        color: "var(--danger-color)",
                        border: "1px solid var(--danger-color)",
                        borderRadius: "0.5rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Trash2 size={15} />
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
                style={{ maxWidth: "500px", width: "90%", margin: "1rem" }}
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
                    size={40}
                    style={{ color: "var(--danger-color)", flexShrink: 0 }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                      Delete Category
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9375rem",
                      }}
                    >
                      &ldquo;{deleteModal.name}&rdquo;
                    </p>
                  </div>
                </div>

                <p style={{ marginBottom: "1rem", fontSize: "0.9375rem" }}>
                  This category has{" "}
                  <strong>
                    {deleteModal.article_count || 0} article
                    {deleteModal.article_count !== 1 ? "s" : ""}
                  </strong>
                  . What would you like to do with them?
                </p>

                <div
                  style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {[
                    {
                      value: "reassign",
                      label: "Move articles to another category",
                      extra: deleteAction === "reassign" && (
                        <select
                          className="select"
                          value={reassignCategoryId}
                          onChange={(e) =>
                            setReassignCategoryId(e.target.value)
                          }
                          style={{ marginTop: "0.5rem", width: "100%" }}
                        >
                          <option value="">Select a category…</option>
                          {availableCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      ),
                      danger: false,
                    },
                    {
                      value: "uncategorize",
                      label: "Keep articles but remove their category",
                      sub: "Articles will remain without a category.",
                      danger: false,
                    },
                    {
                      value: "delete_all",
                      label: "Delete category and all its articles",
                      sub: "⚠️ This cannot be undone!",
                      danger: true,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.625rem",
                        padding: "0.875rem",
                        border: `2px solid ${
                          deleteAction === opt.value
                            ? opt.danger
                              ? "var(--danger-color)"
                              : "var(--primary-color)"
                            : "var(--border-color)"
                        }`,
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        background:
                          deleteAction === opt.value
                            ? opt.danger
                              ? "rgba(239,68,68,0.06)"
                              : "rgba(37,99,235,0.04)"
                            : "transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="deleteAction"
                        value={opt.value}
                        checked={deleteAction === opt.value}
                        onChange={(e) => setDeleteAction(e.target.value)}
                        style={{ marginTop: "0.2rem", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong
                          style={{
                            color: opt.danger
                              ? "var(--danger-color)"
                              : "inherit",
                          }}
                        >
                          {opt.label}
                        </strong>
                        {opt.sub && (
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--text-secondary)",
                              marginTop: "0.2rem",
                            }}
                          >
                            {opt.sub}
                          </p>
                        )}
                        {opt.extra}
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={
                      deleteAction === "reassign" && !reassignCategoryId
                    }
                    style={{ flex: 1 }}
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

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Filter,
} from "lucide-react";

const STATUS_COLORS = {
  active: { bg: "#d1fae5", text: "#065f46" },
  suspended: { bg: "#fee2e2", text: "#991b1b" },
};

function ConfirmModal({ message, onConfirm, onCancel, dangerous }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 420,
          width: "90%",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <AlertCircle
          size={40}
          color={dangerous ? "#dc2626" : "#f59e0b"}
          style={{ margin: "0 auto 1rem" }}
        />
        <p style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>{message}</p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            className="btn"
            style={{ background: "var(--surface)" }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={dangerous ? { background: "#dc2626" } : {}}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, per_page: perPage, search };
      if (filterStatus !== "") params.is_active = filterStatus === "active";
      const data = await adminService.listTenants(params);
      setTenants(data.tenants || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, filterStatus, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleAction = (action, tenant) => {
    if (action === "delete") {
      setConfirm({
        message: `Permanently delete "${tenant.name}"? This cannot be undone and will remove all associated data.`,
        dangerous: true,
        onConfirm: async () => {
          setConfirm(null);
          await runAction(action, tenant.id, tenant.name);
        },
      });
    } else {
      runAction(action, tenant.id, tenant.name);
    }
  };

  const runAction = async (action, id, name) => {
    setActionLoading(id + action);
    try {
      if (action === "suspend") await adminService.suspendTenant(id);
      else if (action === "activate") await adminService.activateTenant(id);
      else if (action === "delete") await adminService.deleteTenant(id);
      showToast(
        action === "suspend"
          ? `"${name}" suspended`
          : action === "activate"
            ? `"${name}" activated`
            : `"${name}" deleted`,
      );
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={24} color="white" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
              Tenant Management
            </h1>
          </div>
          <p
            style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}
          >
            View, suspend, activate, or delete tenant organisations across the
            platform
          </p>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 220 }}
            >
              <div style={{ position: "relative", flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                  }}
                />
                <input
                  className="form-input"
                  style={{ paddingLeft: "2.25rem" }}
                  placeholder="Search name, slug, or domain…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </form>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Filter size={16} color="var(--text-secondary)" />
              <select
                className="form-input"
                style={{ width: "auto" }}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button
              className="btn"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              onClick={load}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              className="card"
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "1rem",
                borderLeft: "4px solid var(--danger-color)",
                marginBottom: "1rem",
              }}
            >
              <AlertCircle size={20} color="var(--danger-color)" />
              <span style={{ color: "var(--danger-color)" }}>{error}</span>
            </div>
          )}

          {/* Table */}
          <div className="card" style={{ overflow: "hidden", padding: 0 }}>
            {loading ? (
              <div className="loading" style={{ minHeight: 200 }}>
                <div className="spinner"></div>
              </div>
            ) : tenants.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <Building2
                  size={40}
                  style={{ margin: "0 auto 0.75rem", opacity: 0.4 }}
                />
                <div>No tenants found</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background: "var(--surface)",
                      }}
                    >
                      {[
                        "Name",
                        "Slug",
                        "Domain",
                        "Users",
                        "Articles",
                        "Status",
                        "Created",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => {
                      const statusKey = t.is_active ? "active" : "suspended";
                      return (
                        <tr
                          key={t.id}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--surface)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "")
                          }
                        >
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              fontWeight: 600,
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.name}
                            {t.is_verified && (
                              <CheckCircle
                                size={13}
                                color="#10b981"
                                style={{
                                  marginLeft: 4,
                                  verticalAlign: "middle",
                                }}
                              />
                            )}
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)",
                              maxWidth: 130,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.slug}
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              fontSize: "0.85rem",
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.primary_domain || "—"}
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              textAlign: "center",
                            }}
                          >
                            {t.user_count ?? 0}
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              textAlign: "center",
                            }}
                          >
                            {t.article_count ?? 0}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                padding: "0.2rem 0.6rem",
                                borderRadius: 9999,
                                background: STATUS_COLORS[statusKey].bg,
                                color: STATUS_COLORS[statusKey].text,
                              }}
                            >
                              {statusKey}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              fontSize: "0.82rem",
                              color: "var(--text-secondary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.created_at
                              ? new Date(t.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "0.85rem 1rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              {t.is_active ? (
                                <button
                                  className="btn"
                                  style={{
                                    padding: "0.3rem 0.7rem",
                                    fontSize: "0.78rem",
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    border: "none",
                                  }}
                                  disabled={actionLoading === t.id + "suspend"}
                                  onClick={() => handleAction("suspend", t)}
                                >
                                  {actionLoading === t.id + "suspend"
                                    ? "…"
                                    : "Suspend"}
                                </button>
                              ) : (
                                <button
                                  className="btn"
                                  style={{
                                    padding: "0.3rem 0.7rem",
                                    fontSize: "0.78rem",
                                    background: "#d1fae5",
                                    color: "#065f46",
                                    border: "none",
                                  }}
                                  disabled={actionLoading === t.id + "activate"}
                                  onClick={() => handleAction("activate", t)}
                                >
                                  {actionLoading === t.id + "activate"
                                    ? "…"
                                    : "Activate"}
                                </button>
                              )}
                              <button
                                className="btn"
                                style={{
                                  padding: "0.3rem 0.5rem",
                                  fontSize: "0.78rem",
                                  background: "#fee2e2",
                                  color: "#991b1b",
                                  border: "none",
                                }}
                                disabled={actionLoading === t.id + "delete"}
                                onClick={() => handleAction("delete", t)}
                              >
                                {actionLoading === t.id + "delete" ? (
                                  "…"
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>
                Showing {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, total)} of {total} tenants
              </span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="btn"
                  style={{ padding: "0.4rem 0.6rem" }}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className="btn"
                      style={{
                        padding: "0.4rem 0.75rem",
                        background: p === page ? "var(--primary-color)" : "",
                        color: p === page ? "white" : "",
                      }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="btn"
                  style={{ padding: "0.4rem 0.6rem" }}
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "1.5rem",
              right: "1.5rem",
              background: toast.type === "error" ? "#dc2626" : "#10b981",
              color: "white",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              fontWeight: 500,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {toast.type === "error" ? (
              <XCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            {toast.msg}
          </div>
        )}

        {/* Confirm Dialog */}
        {confirm && (
          <ConfirmModal
            message={confirm.message}
            dangerous={confirm.dangerous}
            onConfirm={confirm.onConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}
      </DashboardLayout>
    </AdminRoute>
  );
}

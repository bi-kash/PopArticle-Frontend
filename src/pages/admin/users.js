import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldOff,
  Filter,
  RefreshCw,
} from "lucide-react";

function Badge({ active }) {
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.2rem 0.55rem",
        borderRadius: 9999,
        background: active ? "#d1fae5" : "#fee2e2",
        color: active ? "#065f46" : "#991b1b",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AdminBadge({ isSuperAdmin }) {
  if (!isSuperAdmin) return null;
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "0.15rem 0.5rem",
        borderRadius: 9999,
        background: "#fef3c7",
        color: "#92400e",
        marginLeft: "0.4rem",
      }}
    >
      Global Admin
    </span>
  );
}

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
        <p style={{ marginBottom: "1.5rem" }}>{message}</p>
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

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTenant, setFilterTenant] = useState("");
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
      if (filterTenant.trim()) params.tenant_id = filterTenant.trim();
      const data = await adminService.listUsers(params);
      console.log("Admin users response:", data);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Admin users error:", err);
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, filterStatus, filterTenant, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const promptConfirm = (message, onConfirm, dangerous = false) => {
    setConfirm({
      message,
      onConfirm: () => {
        setConfirm(null);
        onConfirm();
      },
      dangerous,
    });
  };

  const runAction = async (action, userId, label) => {
    setActionLoading(userId + action);
    try {
      if (action === "deactivate") await adminService.deactivateUser(userId);
      else if (action === "activate") await adminService.activateUser(userId);
      else if (action === "grant") await adminService.grantAdmin(userId);
      else if (action === "revoke") await adminService.revokeAdmin(userId);

      const messages = {
        deactivate: "User deactivated",
        activate: "User activated",
        grant: `Global admin privileges granted to ${label}`,
        revoke: `Global admin privileges revoked from ${label}`,
      };
      showToast(messages[action]);
      load();
    } catch (err) {
      console.error("Admin user action error:", err);
      showToast(err.response?.data?.error || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = (action, user) => {
    const label = user.full_name || user.username || user.email;
    if (action === "grant") {
      promptConfirm(`Grant global admin privileges to "${label}"?`, () =>
        runAction(action, user.id, label),
      );
    } else if (action === "revoke") {
      promptConfirm(
        `Revoke global admin privileges from "${label}"?`,
        () => runAction(action, user.id, label),
        true,
      );
    } else if (action === "deactivate") {
      promptConfirm(
        `Deactivate account for "${label}"?`,
        () => runAction(action, user.id, label),
        true,
      );
    } else {
      runAction(action, user.id, label);
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
            <Users size={26} color="#3b82f6" />
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
              User Management
            </h1>
          </div>
          <p
            style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}
          >
            Manage all platform users — activate / deactivate accounts and
            manage global admin roles
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
                  placeholder="Search email, username, or name…"
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
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <input
              className="form-input"
              style={{ maxWidth: 220 }}
              placeholder="Filter by tenant ID…"
              value={filterTenant}
              onChange={(e) => {
                setFilterTenant(e.target.value);
                setPage(1);
              }}
            />

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
            ) : users.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <Users
                  size={40}
                  style={{ margin: "0 auto 0.75rem", opacity: 0.4 }}
                />
                <div>No users found</div>
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
                        "User",
                        "Email",
                        "Role",
                        "Tenant",
                        "OAuth",
                        "Status",
                        "Last Login",
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
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td style={{ padding: "0.85rem 1rem", maxWidth: 200 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u.full_name || u.username || "—"}
                            <AdminBadge isSuperAdmin={u.is_super_admin} />
                          </div>
                          {u.username && u.full_name && (
                            <div
                              style={{
                                fontSize: "0.77rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              @{u.username}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            fontSize: "0.85rem",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email}
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {u.role || "—"}
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            fontSize: "0.78rem",
                            color: "var(--text-secondary)",
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.tenant_id ? (
                            <span title={u.tenant_id}>
                              {u.tenant_id.slice(0, 8)}…
                            </span>
                          ) : (
                            <span style={{ fontStyle: "italic" }}>
                              Platform
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            fontSize: "0.82rem",
                          }}
                        >
                          {u.oauth_provider ? (
                            <span style={{ textTransform: "capitalize" }}>
                              {u.oauth_provider}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-secondary)" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <Badge active={u.is_active} />
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.last_login_at
                            ? new Date(u.last_login_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.4rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {u.is_active ? (
                              <button
                                className="btn"
                                style={{
                                  padding: "0.3rem 0.65rem",
                                  fontSize: "0.75rem",
                                  background: "#fee2e2",
                                  color: "#991b1b",
                                  border: "none",
                                }}
                                disabled={!!actionLoading}
                                onClick={() => handleAction("deactivate", u)}
                              >
                                {actionLoading === u.id + "deactivate"
                                  ? "…"
                                  : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                className="btn"
                                style={{
                                  padding: "0.3rem 0.65rem",
                                  fontSize: "0.75rem",
                                  background: "#d1fae5",
                                  color: "#065f46",
                                  border: "none",
                                }}
                                disabled={!!actionLoading}
                                onClick={() => handleAction("activate", u)}
                              >
                                {actionLoading === u.id + "activate"
                                  ? "…"
                                  : "Activate"}
                              </button>
                            )}

                            {u.is_super_admin ? (
                              <button
                                className="btn"
                                title="Revoke Global Admin"
                                style={{
                                  padding: "0.3rem 0.5rem",
                                  fontSize: "0.75rem",
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  border: "none",
                                }}
                                disabled={!!actionLoading}
                                onClick={() => handleAction("revoke", u)}
                              >
                                {actionLoading === u.id + "revoke" ? (
                                  "…"
                                ) : (
                                  <ShieldOff size={14} />
                                )}
                              </button>
                            ) : (
                              <button
                                className="btn"
                                title="Grant Global Admin"
                                style={{
                                  padding: "0.3rem 0.5rem",
                                  fontSize: "0.75rem",
                                  background: "#ede9fe",
                                  color: "#5b21b6",
                                  border: "none",
                                }}
                                disabled={!!actionLoading}
                                onClick={() => handleAction("grant", u)}
                              >
                                {actionLoading === u.id + "grant" ? (
                                  "…"
                                ) : (
                                  <ShieldCheck size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                {Math.min(page * perPage, total)} of {total} users
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

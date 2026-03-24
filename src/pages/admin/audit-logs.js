import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";

const ACTION_COLORS = {
  "dashboard.view": { bg: "#dbeafe", text: "#1e40af" },
  "tenant.suspend": { bg: "#fee2e2", text: "#991b1b" },
  "tenant.activate": { bg: "#d1fae5", text: "#065f46" },
  "tenant.delete": { bg: "#ffe4e6", text: "#9f1239" },
  "user.deactivate": { bg: "#fee2e2", text: "#991b1b" },
  "user.activate": { bg: "#d1fae5", text: "#065f46" },
  "admin.grant": { bg: "#fef3c7", text: "#92400e" },
  "admin.revoke": { bg: "#f3f4f6", text: "#374151" },
};

const RESOURCE_TYPES = ["tenant", "user", "system"];
const ACTIONS = [
  "dashboard.view",
  "tenant.suspend",
  "tenant.activate",
  "tenant.delete",
  "user.deactivate",
  "user.activate",
  "admin.grant",
  "admin.revoke",
];

function ActionBadge({ action }) {
  const style = ACTION_COLORS[action] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.2rem 0.6rem",
        borderRadius: 9999,
        background: style.bg,
        color: style.text,
        whiteSpace: "nowrap",
      }}
    >
      {action}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage] = useState(50);
  const [filterAdminId, setFilterAdminId] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, per_page: perPage };
      if (filterAdminId.trim()) params.admin_user_id = filterAdminId.trim();
      if (filterAction) params.action = filterAction;
      if (filterResource) params.resource_type = filterResource;
      const data = await adminService.getAuditLogs(params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterAdminId, filterAction, filterResource, router]);

  useEffect(() => {
    load();
  }, [load]);

  const resetFilters = () => {
    setFilterAdminId("");
    setFilterAction("");
    setFilterResource("");
    setPage(1);
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
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClipboardList size={24} color="white" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Audit Logs</h1>
          </div>
          <p
            style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}
          >
            Every admin action — who did what, on which resource, and when
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
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Filter size={16} color="var(--text-secondary)" />
              <select
                className="form-input"
                style={{ width: "auto" }}
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="form-input"
              style={{ width: "auto" }}
              value={filterResource}
              onChange={(e) => {
                setFilterResource(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Resources</option>
              {RESOURCE_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: "2.1rem", maxWidth: 200 }}
                placeholder="Admin user ID…"
                value={filterAdminId}
                onChange={(e) => {
                  setFilterAdminId(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button
              className="btn"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              onClick={load}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            {(filterAction || filterResource || filterAdminId) && (
              <button
                className="btn"
                style={{ color: "#6b7280", fontSize: "0.82rem" }}
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
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
            ) : logs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <ClipboardList
                  size={40}
                  style={{ margin: "0 auto 0.75rem", opacity: 0.4 }}
                />
                <div>No audit log entries found</div>
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
                        "#",
                        "Admin",
                        "Action",
                        "Resource Type",
                        "Resource ID",
                        "Details",
                        "IP Address",
                        "Timestamp",
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
                    {logs.map((log) => (
                      <tr
                        key={log.id}
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
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {log.id}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", maxWidth: 180 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {log.admin_email}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            ID: {log.admin_user_id}
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <ActionBadge action={log.action} />
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.82rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.5rem",
                              borderRadius: 9999,
                              background: "#e0e7ff",
                              color: "#3730a3",
                            }}
                          >
                            {log.resource_type || "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.78rem",
                            color: "var(--text-secondary)",
                            maxWidth: 140,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.resource_id ? (
                            <span title={log.resource_id}>
                              {String(log.resource_id).slice(0, 12)}
                              {String(log.resource_id).length > 12 ? "…" : ""}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.8rem",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.details
                            ? Object.entries(log.details)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.ip_address || "—"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(log.created_at)}
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
                {Math.min(page * perPage, total)} of {total} entries
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
      </DashboardLayout>
    </AdminRoute>
  );
}

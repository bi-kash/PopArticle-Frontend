import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  PieChart,
  FileText,
  AlertCircle,
  RefreshCw,
  Zap,
  Calendar,
  Link2,
  BarChart2,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 365 days", value: 365 },
];

function MetricCard({ label, value, sub, color = "var(--primary-color)" }) {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            marginTop: "0.3rem",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, icon: Icon, color, children }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "1.25rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "0.5rem",
            background: color + "20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={color} />
        </div>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, sub, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        {label}
      </span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontWeight: 600, color: accent || "inherit" }}>
          {value ?? "—"}
        </span>
        {sub && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function BarChart({ data, color = "#10b981" }) {
  const max = Math.max(...Object.values(data || {}), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      {Object.entries(data || {}).map(([key, val]) => (
        <div
          key={key}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              width: 80,
              textAlign: "right",
              textTransform: "capitalize",
              flexShrink: 0,
            }}
          >
            {key}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: "var(--border-color)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(val / max) * 100}%`,
                height: "100%",
                background: color,
                borderRadius: 4,
                transition: "width 0.4s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              width: 36,
              flexShrink: 0,
            }}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLORS = {
  draft: "#6b7280",
  published: "#10b981",
  archived: "#f59e0b",
};

export default function ContentAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getContentAnalytics(days);
      console.log("Admin API response:", res);
      setData(res);
    } catch (err) {
      console.error("Content analytics error:", err);
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load content analytics");
    } finally {
      setLoading(false);
    }
  };

  const c = data?.content;

  return (
    <AdminRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.4rem",
                }}
              >
                <PieChart size={28} color="#dc2626" />
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Content Analytics
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                Article creation, AI generation performance, scheduling, and
                affiliate link analytics
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <select
                className="form-input"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{ width: "auto" }}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={loadData}
                disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1.5rem",
                borderLeft: "4px solid var(--danger-color)",
              }}
            >
              <AlertCircle size={22} color="var(--danger-color)" />
              <span style={{ color: "var(--danger-color)" }}>{error}</span>
            </div>
          ) : (
            <>
              {/* Metric Summary strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.75rem",
                }}
              >
                <MetricCard
                  label={`Articles Created (${days}d)`}
                  value={c?.articles_created_in_period}
                  color="#10b981"
                />
                <MetricCard
                  label={`Articles Published (${days}d)`}
                  value={c?.articles_published_in_period}
                  color="#3b82f6"
                />
                <MetricCard
                  label="Total Views"
                  value={c?.total_views?.toLocaleString()}
                  color="#8b5cf6"
                />
                <MetricCard
                  label="AI Success Rate"
                  value={
                    c?.generation?.success_rate != null
                      ? `${c.generation.success_rate}%`
                      : "—"
                  }
                  sub={`${c?.generation?.successful ?? 0} / ${c?.generation?.total_attempts ?? 0} attempts`}
                  color={
                    c?.generation?.success_rate >= 90 ? "#10b981" : "#f59e0b"
                  }
                />
                <MetricCard
                  label="Featured Articles"
                  value={c?.featured_articles}
                  color="#f59e0b"
                />
                <MetricCard
                  label="Active Schedules"
                  value={c?.active_scheduling_configs}
                  color="#6b7280"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {/* Article Status Distribution */}
                <SectionCard
                  title="Article Status Distribution"
                  icon={FileText}
                  color="#10b981"
                >
                  {c?.status_distribution ? (
                    <BarChart data={c.status_distribution} color="#10b981" />
                  ) : (
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      No data
                    </div>
                  )}
                </SectionCard>

                {/* AI Generation */}
                <SectionCard
                  title="AI Generation Performance"
                  icon={Zap}
                  color="#8b5cf6"
                >
                  <StatRow
                    label="Total Attempts"
                    value={c?.generation?.total_attempts}
                  />
                  <StatRow
                    label="Successful"
                    value={c?.generation?.successful}
                    accent="#10b981"
                  />
                  <StatRow
                    label="Failed"
                    value={c?.generation?.failed}
                    accent={c?.generation?.failed > 0 ? "#ef4444" : undefined}
                  />
                  <StatRow
                    label="Success Rate"
                    value={
                      c?.generation?.success_rate != null
                        ? `${c.generation.success_rate}%`
                        : "—"
                    }
                    accent={
                      c?.generation?.success_rate >= 90 ? "#10b981" : "#f59e0b"
                    }
                  />
                  <StatRow
                    label="Avg Generation Time"
                    value={
                      c?.generation?.avg_generation_time_ms != null
                        ? `${(c.generation.avg_generation_time_ms / 1000).toFixed(1)}s`
                        : "—"
                    }
                  />
                </SectionCard>

                {/* Scheduling */}
                <SectionCard title="Scheduling" icon={Calendar} color="#f59e0b">
                  <StatRow
                    label="Active Scheduling Configs"
                    value={c?.active_scheduling_configs}
                  />
                </SectionCard>

                {/* Affiliate Links */}
                <SectionCard
                  title="Affiliate Links"
                  icon={Link2}
                  color="#3b82f6"
                >
                  <StatRow
                    label="Total Links"
                    value={c?.affiliate_links?.total_links}
                  />
                  <StatRow
                    label="Active Links"
                    value={c?.affiliate_links?.active_links}
                    accent="#10b981"
                  />
                  <StatRow
                    label={`Clicks (${days}d)`}
                    value={c?.affiliate_links?.clicks_in_period?.toLocaleString()}
                    accent="#3b82f6"
                  />
                  {c?.affiliate_links?.top_links?.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Top Affiliate Links
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.82rem",
                          }}
                        >
                          <thead>
                            <tr>
                              {["Product", "Service", "Clicks"].map((h) => (
                                <th
                                  key={h}
                                  style={{
                                    textAlign:
                                      h === "Clicks" ? "right" : "left",
                                    padding: "0.4rem 0.5rem",
                                    color: "var(--text-secondary)",
                                    fontWeight: 500,
                                    borderBottom:
                                      "1px solid var(--border-color)",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {c.affiliate_links.top_links.map((link) => (
                              <tr key={link.id}>
                                <td
                                  style={{
                                    padding: "0.5rem",
                                    borderBottom:
                                      "1px solid var(--border-color)",
                                    maxWidth: 180,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {link.product_name}
                                </td>
                                <td
                                  style={{
                                    padding: "0.5rem",
                                    borderBottom:
                                      "1px solid var(--border-color)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {link.service}
                                </td>
                                <td
                                  style={{
                                    padding: "0.5rem",
                                    textAlign: "right",
                                    borderBottom:
                                      "1px solid var(--border-color)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {link.clicks}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Top Articles */}
                {c?.top_articles?.length > 0 && (
                  <SectionCard
                    title="Top Articles by Views"
                    icon={BarChart2}
                    color="#6b7280"
                  >
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "0.82rem",
                        }}
                      >
                        <thead>
                          <tr>
                            {["Title", "Status", "Views"].map((h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: h === "Views" ? "right" : "left",
                                  padding: "0.4rem 0.5rem",
                                  color: "var(--text-secondary)",
                                  fontWeight: 500,
                                  borderBottom: "1px solid var(--border-color)",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {c.top_articles.map((a) => (
                            <tr key={a.id}>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  borderBottom: "1px solid var(--border-color)",
                                  maxWidth: 220,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {a.title}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  borderBottom: "1px solid var(--border-color)",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    padding: "2px 8px",
                                    borderRadius: 99,
                                    fontWeight: 600,
                                    background:
                                      (STATUS_COLORS[a.status] || "#6b7280") +
                                      "20",
                                    color: STATUS_COLORS[a.status] || "#6b7280",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {a.status}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "right",
                                  borderBottom: "1px solid var(--border-color)",
                                  fontWeight: 600,
                                }}
                              >
                                {a.views?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

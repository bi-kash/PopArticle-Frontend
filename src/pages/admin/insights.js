import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  BarChart2,
  Users,
  FileText,
  Share2,
  Activity,
  Building2,
  AlertCircle,
  RefreshCw,
  Server,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 365 days", value: 365 },
];

function SectionCard({ title, icon: Icon, color, children }) {
  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
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

function DistributionBar({ data, colorMap }) {
  const total = Object.values(data || {}).reduce((s, v) => s + v, 0);
  if (!total)
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        No data
      </div>
    );
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: "0.75rem",
        }}
      >
        {Object.entries(data).map(([key, count]) => (
          <div
            key={key}
            style={{
              width: `${(count / total) * 100}%`,
              background: colorMap?.[key] || "#6b7280",
              transition: "width 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
        {Object.entries(data).map(([key, count]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8rem",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colorMap?.[key] || "#6b7280",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "var(--text-secondary)",
                textTransform: "capitalize",
              }}
            >
              {key}
            </span>
            <span style={{ fontWeight: 600 }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthScore({ score }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div
        style={{
          width: 80,
          height: 8,
          borderRadius: 4,
          background: "var(--border-color)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.4s",
          }}
        />
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color }}>
        {score}
      </span>
    </div>
  );
}

const PLAN_COLORS = {
  free: "#6b7280",
  basic: "#3b82f6",
  pro: "#8b5cf6",
  enterprise: "#f59e0b",
};
const STATUS_COLORS = {
  active: "#10b981",
  canceled: "#ef4444",
  past_due: "#f59e0b",
  paused: "#6b7280",
  trialing: "#3b82f6",
};
const ARTICLE_STATUS_COLORS = {
  draft: "#6b7280",
  published: "#10b981",
  archived: "#f59e0b",
};
const SOCIAL_STATUS_COLORS = {
  success: "#10b981",
  failed: "#ef4444",
  scheduled: "#3b82f6",
};

export default function PlatformInsightsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadInsights();
  }, [days]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getPlatformInsights(days);
      console.log("Admin API response:", res);
      setData(res);
    } catch (err) {
      console.error("Platform insights error:", err);
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load platform insights");
    } finally {
      setLoading(false);
    }
  };

  const s = data?.subscriptions;
  const c = data?.content;
  const sm = data?.social_media;
  const ua = data?.user_activity;
  const sh = data?.system_health;
  const th = data?.tenant_health;

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
                <BarChart2 size={28} color="#dc2626" />
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Platform Insights
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                Comprehensive analytics across subscriptions, content, social
                media, and system health
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
                onClick={loadInsights}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(520px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* ── Subscriptions ── */}
              <SectionCard
                title="Subscriptions"
                icon={TrendingUp}
                color="#8b5cf6"
              >
                <StatRow label="Total Active" value={s?.total_active} />
                <StatRow
                  label="Estimated MRR (USD)"
                  value={
                    s?.estimated_mrr?.USD != null
                      ? `$${s.estimated_mrr.USD.toLocaleString()}`
                      : "—"
                  }
                  accent="#10b981"
                />
                <StatRow
                  label="New Subscriptions"
                  value={s?.new_subscriptions}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Recent Cancellations"
                  value={s?.recent_cancellations}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Churn Rate"
                  value={s?.churn_rate != null ? `${s.churn_rate}%` : "—"}
                  accent={s?.churn_rate > 5 ? "#ef4444" : "#10b981"}
                />
                <StatRow
                  label="Avg Article Limit Used"
                  value={
                    s?.usage?.avg_article_limit_utilization_pct != null
                      ? `${s.usage.avg_article_limit_utilization_pct}%`
                      : "—"
                  }
                />
                <StatRow
                  label="Users at Article Limit"
                  value={s?.usage?.users_at_article_limit}
                />
                {s?.plan_distribution && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Plan Distribution
                    </div>
                    <DistributionBar
                      data={s.plan_distribution}
                      colorMap={PLAN_COLORS}
                    />
                  </div>
                )}
                {s?.status_distribution && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Status Distribution
                    </div>
                    <DistributionBar
                      data={s.status_distribution}
                      colorMap={STATUS_COLORS}
                    />
                  </div>
                )}
              </SectionCard>

              {/* ── User Activity ── */}
              <SectionCard title="User Activity" icon={Users} color="#3b82f6">
                <StatRow label="Total Users" value={ua?.total_users} />
                <StatRow
                  label="New Registrations"
                  value={ua?.new_registrations}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Active Logins"
                  value={ua?.active_logins_in_period}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Login Rate"
                  value={ua?.login_rate != null ? `${ua.login_rate}%` : "—"}
                />
                <StatRow
                  label="Growth vs Prev Period"
                  value={
                    ua?.growth_rate_vs_previous_period != null
                      ? `${ua.growth_rate_vs_previous_period}%`
                      : "—"
                  }
                  accent={
                    ua?.growth_rate_vs_previous_period >= 0
                      ? "#10b981"
                      : "#ef4444"
                  }
                />
                <StatRow label="Verified Users" value={ua?.verified_users} />
                <StatRow
                  label="Dormant Users (90d)"
                  value={ua?.dormant_users_90d}
                />
                {ua?.authentication && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Auth Methods
                    </div>
                    <DistributionBar
                      data={{
                        password: ua.authentication.password_users,
                        oauth: ua.authentication.oauth_users,
                      }}
                      colorMap={{ password: "#3b82f6", oauth: "#f59e0b" }}
                    />
                  </div>
                )}
                {ua?.authentication?.oauth_providers &&
                  Object.keys(ua.authentication.oauth_providers).length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        OAuth Providers
                      </div>
                      <DistributionBar
                        data={ua.authentication.oauth_providers}
                        colorMap={{
                          google: "#ef4444",
                          github: "#6b7280",
                          linkedin: "#3b82f6",
                          facebook: "#1d4ed8",
                        }}
                      />
                    </div>
                  )}
              </SectionCard>

              {/* ── Content ── */}
              <SectionCard title="Content" icon={FileText} color="#10b981">
                <StatRow
                  label="Articles Created"
                  value={c?.articles_created_in_period}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Articles Published"
                  value={c?.articles_published_in_period}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Total Views"
                  value={c?.total_views?.toLocaleString()}
                />
                <StatRow
                  label="Featured Articles"
                  value={c?.featured_articles}
                />
                <StatRow
                  label="Active Scheduling Configs"
                  value={c?.active_scheduling_configs}
                />
                {c?.generation && (
                  <>
                    <div
                      style={{
                        margin: "0.75rem 0 0.25rem",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      AI Generation
                    </div>
                    <StatRow
                      label="Total Attempts"
                      value={c.generation.total_attempts}
                    />
                    <StatRow
                      label="Successful"
                      value={c.generation.successful}
                    />
                    <StatRow
                      label="Failed"
                      value={c.generation.failed}
                      accent={c.generation.failed > 0 ? "#f59e0b" : undefined}
                    />
                    <StatRow
                      label="Success Rate"
                      value={
                        c.generation.success_rate != null
                          ? `${c.generation.success_rate}%`
                          : "—"
                      }
                      accent={
                        c.generation.success_rate >= 90 ? "#10b981" : "#f59e0b"
                      }
                    />
                    <StatRow
                      label="Avg Generation Time"
                      value={
                        c.generation.avg_generation_time_ms != null
                          ? `${(c.generation.avg_generation_time_ms / 1000).toFixed(1)}s`
                          : "—"
                      }
                    />
                  </>
                )}
                {c?.status_distribution && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Article Status
                    </div>
                    <DistributionBar
                      data={c.status_distribution}
                      colorMap={ARTICLE_STATUS_COLORS}
                    />
                  </div>
                )}
                {c?.top_articles?.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Top Articles by Views
                    </div>
                    {c.top_articles.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.35rem 0",
                          fontSize: "0.85rem",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {a.title}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            marginLeft: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          {a.views?.toLocaleString()} views
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Social Media ── */}
              <SectionCard title="Social Media" icon={Share2} color="#f59e0b">
                <StatRow
                  label="Total Posts"
                  value={sm?.total_posts_in_period}
                  sub={`last ${days}d`}
                />
                <StatRow
                  label="Successful Posts"
                  value={sm?.successful_posts}
                />
                <StatRow
                  label="Success Rate"
                  value={sm?.success_rate != null ? `${sm.success_rate}%` : "—"}
                  accent={sm?.success_rate >= 90 ? "#10b981" : "#f59e0b"}
                />
                <StatRow
                  label="Active Connected Accounts"
                  value={sm?.active_connected_accounts}
                />
                <StatRow
                  label="AI-Generated Posts"
                  value={sm?.ai_generated_posts}
                />
                <StatRow
                  label="Manually Edited"
                  value={sm?.manually_edited_posts}
                />
                <StatRow
                  label="Pending Scheduled"
                  value={sm?.pending_scheduled_posts}
                />
                {sm?.status_distribution && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Post Status
                    </div>
                    <DistributionBar
                      data={sm.status_distribution}
                      colorMap={SOCIAL_STATUS_COLORS}
                    />
                  </div>
                )}
                {sm?.platform_distribution && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      By Platform
                    </div>
                    <DistributionBar
                      data={sm.platform_distribution}
                      colorMap={{
                        facebook_page: "#1877f2",
                        instagram: "#e1306c",
                        facebook: "#1877f2",
                        twitter: "#1da1f2",
                        linkedin: "#0077b5",
                      }}
                    />
                  </div>
                )}
              </SectionCard>

              {/* ── System Health ── */}
              <SectionCard title="System Health" icon={Server} color="#ef4444">
                <StatRow
                  label="Total API Requests"
                  value={sh?.total_api_requests?.toLocaleString()}
                />
                <StatRow
                  label="Error Rate"
                  value={sh?.error_rate != null ? `${sh.error_rate}%` : "—"}
                  accent={sh?.error_rate > 2 ? "#ef4444" : "#10b981"}
                />
                <StatRow
                  label="Error Requests"
                  value={sh?.error_requests?.toLocaleString()}
                />
                <StatRow
                  label="Server Errors (5xx)"
                  value={sh?.server_errors}
                  accent={sh?.server_errors > 0 ? "#ef4444" : undefined}
                />
                <StatRow
                  label="Avg Response Time"
                  value={
                    sh?.avg_response_time_ms != null
                      ? `${sh.avg_response_time_ms}ms`
                      : "—"
                  }
                  accent={
                    sh?.avg_response_time_ms > 500 ? "#f59e0b" : "#10b981"
                  }
                />
                <StatRow
                  label="P95 Response Time"
                  value={
                    sh?.p95_response_time_ms != null
                      ? `${sh.p95_response_time_ms}ms`
                      : "—"
                  }
                />
                {sh?.top_endpoints?.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Top Endpoints
                    </div>
                    {sh.top_endpoints.map((ep, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.35rem 0",
                          fontSize: "0.8rem",
                          borderBottom: "1px solid var(--border-color)",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              background: "#3b82f620",
                              color: "#3b82f6",
                              borderRadius: 3,
                              padding: "1px 4px",
                              marginRight: "0.4rem",
                              fontSize: "0.7rem",
                            }}
                          >
                            {ep.method}
                          </span>
                          {ep.endpoint}
                        </span>
                        <span style={{ flexShrink: 0, fontWeight: 600 }}>
                          {ep.request_count?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Tenant Health ── */}
              <SectionCard
                title="Tenant Health"
                icon={Building2}
                color="#8b5cf6"
              >
                <StatRow
                  label="Active Tenants"
                  value={th?.total_active_tenants}
                />
                <StatRow
                  label="Avg Health Score"
                  value={
                    th?.avg_health_score != null
                      ? Math.round(th.avg_health_score)
                      : "—"
                  }
                  accent={th?.avg_health_score >= 70 ? "#10b981" : "#f59e0b"}
                />
                {th?.tenants?.length > 0 && (
                  <div style={{ marginTop: "1rem", overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.82rem",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Tenant",
                            "Health",
                            "Users",
                            "Articles",
                            "Views",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: h === "Tenant" ? "left" : "right",
                                padding: "0.4rem 0.5rem",
                                color: "var(--text-secondary)",
                                fontWeight: 500,
                                borderBottom: "1px solid var(--border-color)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {th.tenants.map((t) => (
                          <tr key={t.id}>
                            <td
                              style={{
                                padding: "0.5rem",
                                borderBottom: "1px solid var(--border-color)",
                                maxWidth: 140,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.name}
                            </td>
                            <td
                              style={{
                                padding: "0.5rem",
                                borderBottom: "1px solid var(--border-color)",
                              }}
                            >
                              <HealthScore score={t.health_score} />
                            </td>
                            <td
                              style={{
                                padding: "0.5rem",
                                textAlign: "right",
                                borderBottom: "1px solid var(--border-color)",
                              }}
                            >
                              {t.users}
                            </td>
                            <td
                              style={{
                                padding: "0.5rem",
                                textAlign: "right",
                                borderBottom: "1px solid var(--border-color)",
                              }}
                            >
                              {t.total_articles}
                            </td>
                            <td
                              style={{
                                padding: "0.5rem",
                                textAlign: "right",
                                borderBottom: "1px solid var(--border-color)",
                              }}
                            >
                              {t.total_views?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

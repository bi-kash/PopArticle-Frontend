import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  DollarSign,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 365 days", value: 365 },
];

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

function MetricCard({
  label,
  value,
  sub,
  color = "var(--primary-color)",
  icon: Icon,
}) {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        borderTop: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "0.4rem",
              background: color + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={15} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            marginTop: "0.2rem",
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

function HorizontalBar({ data, colorMap }) {
  const total = Object.values(data || {}).reduce((s, v) => s + v, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
      {Object.entries(data || {}).map(([key, val]) => {
        const pct = ((val / total) * 100).toFixed(1);
        const color = colorMap?.[key] || "#6b7280";
        return (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                width: 90,
                flexShrink: 0,
                textTransform: "capitalize",
                textAlign: "right",
              }}
            >
              {key}
            </span>
            <div
              style={{
                flex: 1,
                height: 10,
                background: "var(--border-color)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 6,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color,
                width: 40,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RevenueAnalyticsPage() {
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
      const res = await adminService.getRevenueAnalytics(days);
      console.log("Admin API response:", res);
      setData(res);
    } catch (err) {
      console.error("Revenue analytics error:", err);
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        router.replace("/dashboard");
        return;
      }
      setError(err.response?.data?.error || "Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  };

  const r = data?.revenue;

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
                  <DollarSign size={24} color="white" />
                </div>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Revenue Analytics
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                Subscription health, MRR estimates, churn, and billing cycle
                analytics
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
              {/* KPI Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.75rem",
                }}
              >
                <MetricCard
                  icon={DollarSign}
                  label="Estimated MRR (USD)"
                  value={
                    r?.estimated_mrr?.USD != null
                      ? `$${r.estimated_mrr.USD.toLocaleString()}`
                      : "—"
                  }
                  color="#10b981"
                />
                <MetricCard
                  icon={CreditCard}
                  label="Active Subscriptions"
                  value={r?.total_active}
                  color="#3b82f6"
                />
                <MetricCard
                  icon={TrendingUp}
                  label={`New Subscriptions (${days}d)`}
                  value={r?.new_subscriptions}
                  color="#8b5cf6"
                />
                <MetricCard
                  icon={TrendingDown}
                  label="Churn Rate"
                  value={r?.churn_rate != null ? `${r.churn_rate}%` : "—"}
                  color={r?.churn_rate > 5 ? "#ef4444" : "#10b981"}
                />
                <MetricCard
                  icon={Users}
                  label="Conversion Rate"
                  value={
                    r?.conversion_rate != null ? `${r.conversion_rate}%` : "—"
                  }
                  sub="users with subscription"
                  color={r?.conversion_rate >= 50 ? "#10b981" : "#f59e0b"}
                />
                <MetricCard
                  icon={AlertCircle}
                  label="Expiring in 7 Days"
                  value={r?.expiring_within_7_days}
                  color={r?.expiring_within_7_days > 0 ? "#f59e0b" : "#6b7280"}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {/* Subscription Overview */}
                <SectionCard
                  title="Subscription Overview"
                  icon={CreditCard}
                  color="#3b82f6"
                >
                  <StatRow
                    label="Total Active"
                    value={r?.total_active}
                    accent="#10b981"
                  />
                  <StatRow
                    label={`New Subscriptions (${days}d)`}
                    value={r?.new_subscriptions}
                    accent="#3b82f6"
                  />
                  <StatRow
                    label={`Recent Cancellations (${days}d)`}
                    value={r?.recent_cancellations}
                    accent={r?.recent_cancellations > 0 ? "#ef4444" : undefined}
                  />
                  <StatRow
                    label="Churn Rate"
                    value={r?.churn_rate != null ? `${r.churn_rate}%` : "—"}
                    accent={r?.churn_rate > 5 ? "#ef4444" : "#10b981"}
                  />
                  <StatRow
                    label="Active Trials"
                    value={r?.active_trials}
                    accent="#8b5cf6"
                  />
                  <StatRow
                    label="Past Due Subscriptions"
                    value={r?.past_due_subscriptions}
                    accent={
                      r?.past_due_subscriptions > 0 ? "#f59e0b" : undefined
                    }
                  />
                  <StatRow
                    label="Users Without Subscription"
                    value={r?.users_without_subscription}
                  />
                  <StatRow
                    label="Conversion Rate"
                    value={
                      r?.conversion_rate != null ? `${r.conversion_rate}%` : "—"
                    }
                    accent={r?.conversion_rate >= 50 ? "#10b981" : "#f59e0b"}
                  />
                  <StatRow
                    label="Expiring Within 7 Days"
                    value={r?.expiring_within_7_days}
                    accent={
                      r?.expiring_within_7_days > 0 ? "#f59e0b" : undefined
                    }
                  />
                </SectionCard>

                {/* Article Limit Usage */}
                <SectionCard
                  title="Usage Metrics"
                  icon={TrendingUp}
                  color="#8b5cf6"
                >
                  <StatRow
                    label="Avg Article Limit Used"
                    value={
                      r?.usage?.avg_article_limit_utilization_pct != null
                        ? `${r.usage.avg_article_limit_utilization_pct}%`
                        : "—"
                    }
                    accent={
                      r?.usage?.avg_article_limit_utilization_pct > 80
                        ? "#f59e0b"
                        : "#10b981"
                    }
                  />
                  <StatRow
                    label="Users at Article Limit"
                    value={r?.usage?.users_at_article_limit}
                    accent={
                      r?.usage?.users_at_article_limit > 0
                        ? "#f59e0b"
                        : undefined
                    }
                  />
                  {r?.billing_cycles && (
                    <div style={{ marginTop: "1.25rem" }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        Billing Cycles
                      </div>
                      <HorizontalBar
                        data={r.billing_cycles}
                        colorMap={{ month: "#3b82f6", year: "#10b981" }}
                      />
                    </div>
                  )}
                </SectionCard>

                {/* Plan Distribution */}
                {r?.plan_distribution && (
                  <SectionCard
                    title="Plan Distribution"
                    icon={DollarSign}
                    color="#f59e0b"
                  >
                    <HorizontalBar
                      data={r.plan_distribution}
                      colorMap={PLAN_COLORS}
                    />
                    <div style={{ marginTop: "1.25rem" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(100px, 1fr))",
                          gap: "0.75rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {Object.entries(r.plan_distribution).map(
                          ([plan, count]) => {
                            const total = Object.values(
                              r.plan_distribution,
                            ).reduce((a, b) => a + b, 0);
                            const pct = total
                              ? ((count / total) * 100).toFixed(1)
                              : 0;
                            return (
                              <div
                                key={plan}
                                style={{
                                  textAlign: "center",
                                  padding: "0.75rem 0.5rem",
                                  borderRadius: "0.5rem",
                                  background:
                                    (PLAN_COLORS[plan] || "#6b7280") + "15",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: PLAN_COLORS[plan] || "#6b7280",
                                  }}
                                >
                                  {count}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.72rem",
                                    textTransform: "capitalize",
                                    color: "var(--text-secondary)",
                                    marginTop: "0.2rem",
                                  }}
                                >
                                  {plan} ({pct}%)
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* Status Distribution */}
                {r?.status_distribution && (
                  <SectionCard
                    title="Subscription Status"
                    icon={AlertCircle}
                    color="#ef4444"
                  >
                    <HorizontalBar
                      data={r.status_distribution}
                      colorMap={STATUS_COLORS}
                    />
                    <div
                      style={{
                        marginTop: "1.25rem",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {Object.entries(r.status_distribution).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: 99,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background:
                                (STATUS_COLORS[status] || "#6b7280") + "20",
                              color: STATUS_COLORS[status] || "#6b7280",
                              textTransform: "capitalize",
                            }}
                          >
                            {status}: {count}
                          </div>
                        ),
                      )}
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

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Redirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return null;
}
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { adminService } from "@/lib/adminService";
import {
  Users,
  Building2,
  FileText,
  FolderTree,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const card = (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        padding: "1.5rem",
        cursor: href ? "pointer" : "default",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        href && (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) => href && (e.currentTarget.style.boxShadow = "")}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "0.75rem",
          background: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={26} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginBottom: "0.2rem",
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
      {href && <ArrowRight size={18} color="var(--text-secondary)" />}
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {card}
    </Link>
  ) : (
    card
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load admin statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.4rem",
              }}
            >
              <ShieldCheck size={28} color="#dc2626" />
              <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                Admin Dashboard
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>
              Platform-wide system overview — global admin access only
            </p>
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
              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats?.users?.total}
                  sub={`${stats?.users?.active ?? 0} active · ${stats?.users?.inactive ?? 0} inactive`}
                  color="#3b82f6"
                  href="/dashboard/admin/users"
                />
                <StatCard
                  icon={Building2}
                  label="Tenants"
                  value={stats?.tenants?.total}
                  sub={`${stats?.tenants?.active ?? 0} active · ${stats?.tenants?.suspended ?? 0} suspended`}
                  color="#8b5cf6"
                  href="/dashboard/admin/tenants"
                />
                <StatCard
                  icon={FileText}
                  label="Articles"
                  value={stats?.articles?.total}
                  sub={`${stats?.articles?.published ?? 0} published`}
                  color="#10b981"
                />
                <StatCard
                  icon={FolderTree}
                  label="Categories"
                  value={stats?.categories?.total}
                  color="#f59e0b"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Global Admins"
                  value={stats?.global_admins}
                  color="#dc2626"
                  href="/dashboard/admin/users"
                />
              </div>

              {/* Quick Action Cards */}
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "1rem",
                }}
              >
                {[
                  {
                    href: "/dashboard/admin/tenants",
                    icon: Building2,
                    color: "#8b5cf6",
                    title: "Manage Tenants",
                    desc: "Suspend, activate, or delete tenant organisations",
                  },
                  {
                    href: "/dashboard/admin/users",
                    icon: Users,
                    color: "#3b82f6",
                    title: "Manage Users",
                    desc: "Activate / deactivate accounts, grant or revoke admin roles",
                  },
                  {
                    href: "/dashboard/admin/audit-logs",
                    icon: TrendingUp,
                    color: "#f59e0b",
                    title: "Audit Logs",
                    desc: "Review all admin actions with actor, resource, and timestamp",
                  },
                ].map(({ href, icon: Icon, color, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="card"
                      style={{
                        padding: "1.5rem",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 20px rgba(0,0,0,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "")
                      }
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "0.625rem",
                          background: color + "20",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <Icon size={22} color={color} />
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { tenantService } from "@/lib/tenantService";
import {
  Building2,
  Globe,
  Calendar,
  Users,
  Settings,
  ArrowLeft,
  Edit,
} from "lucide-react";

export default function TenantDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadTenantData();
    }
  }, [id]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tenantData, statsData] = await Promise.all([
        tenantService.getTenant(id),
        tenantService.getTenantStats(id).catch(() => null),
      ]);
      setTenant(tenantData.tenant || tenantData);
      setStats(statsData?.stats || statsData);
    } catch (err) {
      console.error("Failed to load tenant:", err);
      setError(err.response?.data?.message || "Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <Building2
              size={48}
              style={{
                color: "var(--danger-color)",
                margin: "0 auto 1rem",
              }}
            />
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              {error}
            </h3>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/dashboard/tenants")}
            >
              <ArrowLeft size={20} />
              Back to Tenants
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!tenant) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <Building2
              size={48}
              style={{
                color: "var(--text-secondary)",
                margin: "0 auto 1rem",
              }}
            />
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Tenant not found
            </h3>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/dashboard/tenants")}
            >
              <ArrowLeft size={20} />
              Back to Tenants
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => router.push("/dashboard/tenants")}
              style={{ marginBottom: "1rem" }}
            >
              <ArrowLeft size={20} />
              Back to Tenants
            </button>
          </div>

          {/* Tenant Header */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Building2
                  size={48}
                  style={{ color: "var(--primary-color)" }}
                />
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {tenant.name}
                  </h1>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Tenant ID: {tenant.id}
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/tenants/${id}/edit`}>
                <button className="btn btn-primary">
                  <Edit size={20} />
                  Edit
                </button>
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Globe size={16} />
                  <span style={{ fontSize: "0.875rem" }}>Primary Domain</span>
                </div>
                <p style={{ fontWeight: 500 }}>{tenant.primary_domain}</p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Settings size={16} />
                  <span style={{ fontSize: "0.875rem" }}>Plan</span>
                </div>
                <p style={{ fontWeight: 500, textTransform: "capitalize" }}>
                  {tenant.plan || "Free"}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Calendar size={16} />
                  <span style={{ fontSize: "0.875rem" }}>Created</span>
                </div>
                <p style={{ fontWeight: 500 }}>
                  {tenant.created_at
                    ? new Date(tenant.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div className="card">
                <div
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Total Articles
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {stats.total_articles || 0}
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Published
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {stats.published_articles || 0}
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Members
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {stats.total_members || 0}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Quick Actions
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <Link href={`/dashboard/tenants/${id}/members`}>
                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  <Users size={20} />
                  Manage Members
                </button>
              </Link>

              <Link href={`/dashboard/tenants/${id}/edit`}>
                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  <Settings size={20} />
                  Tenant Settings
                </button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

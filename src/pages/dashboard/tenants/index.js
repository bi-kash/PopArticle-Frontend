import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { tenantService } from "@/lib/tenantService";
import { Plus, Building2, Users, Settings } from "lucide-react";

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await tenantService.getMyTenants();
      setTenants(data.tenants || []);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Tenants</h1>
            <Link href="/dashboard/tenants/new">
              <button className="btn btn-primary">
                <Plus size={20} />
                Register Tenant
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : tenants.length === 0 ? (
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
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                No Tenants Yet
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "1.5rem",
                }}
              >
                Register your first tenant website to enable multi-tenant
                authentication
              </p>
              <Link href="/dashboard/tenants/new">
                <button className="btn btn-primary">
                  <Plus size={20} />
                  Register Tenant
                </button>
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {tenants.map((tenant) => (
                <div key={tenant.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {tenant.name}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        {tenant.primary_domain}
                      </p>
                    </div>
                    <span
                      className={`badge badge-${
                        tenant.status === "active" ? "success" : "warning"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Plan:{" "}
                      </span>
                      <span style={{ fontWeight: 500 }}>{tenant.plan}</span>
                    </div>
                    {tenant.member_count !== undefined && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>
                          Members:{" "}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          {tenant.member_count}
                        </span>
                      </div>
                    )}
                  </div>

                  {tenant.slug && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginBottom: "1rem",
                      }}
                    >
                      Slug:{" "}
                      <code
                        style={{
                          background: "var(--surface)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {tenant.slug}
                      </code>
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <Link href={`/dashboard/tenants/${tenant.id}`}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: "0.875rem" }}
                      >
                        <Settings size={16} />
                        Manage
                      </button>
                    </Link>
                    <Link href={`/dashboard/tenants/${tenant.id}/members`}>
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: "0.875rem" }}
                      >
                        <Users size={16} />
                        Members
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

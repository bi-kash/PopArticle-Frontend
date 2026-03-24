import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { Plus, Building2, Users, Settings, Globe } from "lucide-react";

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

      // Handle different response structures
      let tenantsArray = [];
      if (Array.isArray(data)) {
        tenantsArray = data;
      } else if (data.tenants && Array.isArray(data.tenants)) {
        tenantsArray = data.tenants;
      } else if (data.data && Array.isArray(data.data)) {
        tenantsArray = data.data;
      }

      setTenants(tenantsArray);
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
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <Plus size={18} />
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
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "1rem",
              }}
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
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  <Plus size={18} />
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
                <div
                  key={tenant.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "0.75rem",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Globe size={20} color="#fff" />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                            marginBottom: "0.125rem",
                          }}
                        >
                          {tenant.name}
                        </h3>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {tenant.primary_domain}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.625rem",
                        borderRadius: "999px",
                        textTransform: "capitalize",
                        background:
                          tenant.status === "active" ? "#d1fae5" : "#fef3c7",
                        color:
                          tenant.status === "active" ? "#065f46" : "#92400e",
                      }}
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
                        style={{
                          flex: 1,
                          fontSize: "0.8125rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          padding: "0.5rem 0.75rem",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        <Settings size={15} />
                        Manage
                      </button>
                    </Link>
                    <Link href={`/dashboard/tenants/${tenant.id}/members`}>
                      <button
                        style={{
                          flex: 1,
                          fontSize: "0.8125rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          padding: "0.5rem 0.75rem",
                          background: "var(--surface)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        <Users size={15} />
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

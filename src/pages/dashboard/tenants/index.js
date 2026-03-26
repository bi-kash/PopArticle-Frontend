import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { getTenantSlug } from "@/lib/tenantUtils";
import {
  Plus,
  Building2,
  Users,
  Settings,
  Globe,
  LayoutDashboard,
  FileText,
  FolderTree,
  Calendar,
  ExternalLink,
} from "lucide-react";

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
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {tenants.map((tenant) => {
                const slug = getTenantSlug(tenant);
                return (
                  <div
                    key={tenant.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(99,102,241,0.12)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
                        padding: "1.25rem 1.5rem",
                        color: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
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
                              width: 44,
                              height: 44,
                              borderRadius: "0.75rem",
                              background: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(10px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Globe size={22} color="#fff" />
                          </div>
                          <div>
                            <h3
                              style={{
                                fontSize: "1.125rem",
                                fontWeight: 700,
                                marginBottom: "0.125rem",
                              }}
                            >
                              {tenant.name}
                            </h3>
                            <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
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
                              tenant.status === "active"
                                ? "rgba(255,255,255,0.25)"
                                : "rgba(255,200,50,0.3)",
                            color: "#fff",
                          }}
                        >
                          {tenant.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "1.25rem 1.5rem" }}>
                      {/* Quick Stats */}
                      <div
                        style={{
                          display: "flex",
                          gap: "1.5rem",
                          marginBottom: "1rem",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {tenant.member_count !== undefined && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            <Users
                              size={14}
                              style={{ color: "var(--text-secondary)" }}
                            />
                            <span style={{ color: "var(--text-secondary)" }}>
                              {tenant.member_count} Members
                            </span>
                          </div>
                        )}
                        {tenant.primary_domain && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            <ExternalLink
                              size={14}
                              style={{ color: "var(--text-secondary)" }}
                            />
                            <a
                              href={`https://${tenant.primary_domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--text-secondary)",
                                textDecoration: "none",
                                fontSize: "0.8125rem",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#6366f1")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "var(--text-secondary)")
                              }
                            >
                              Visit Site
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Quick Navigation */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {[
                          {
                            icon: LayoutDashboard,
                            label: "Dashboard",
                            path: "dashboard",
                          },
                          {
                            icon: FileText,
                            label: "Articles",
                            path: "articles",
                          },
                          {
                            icon: FolderTree,
                            label: "Categories",
                            path: "categories",
                          },
                          {
                            icon: Calendar,
                            label: "Scheduling",
                            path: "scheduling",
                          },
                          { icon: Users, label: "Team", path: "team" },
                          { icon: Settings, label: "Settings", path: "edit" },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              href={`/dashboard/tenants/${slug}/${item.path}`}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  padding: "0.45rem 0.6rem",
                                  borderRadius: "0.5rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  color: "var(--text-secondary)",
                                  background: "var(--background, #f9fafb)",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(99,102,241,0.08)";
                                  e.currentTarget.style.color = "#6366f1";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "var(--background, #f9fafb)";
                                  e.currentTarget.style.color =
                                    "var(--text-secondary)";
                                }}
                              >
                                <Icon size={13} />
                                {item.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <Link
                          href={`/dashboard/tenants/${slug}/dashboard`}
                          style={{ flex: 1 }}
                        >
                          <button
                            style={{
                              width: "100%",
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
                              fontWeight: 600,
                            }}
                          >
                            <LayoutDashboard size={15} />
                            Open Dashboard
                          </button>
                        </Link>
                        <Link href={`/dashboard/tenants/${slug}`}>
                          <button
                            style={{
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
                            <Settings size={15} />
                            Manage
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

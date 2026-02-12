import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { authService } from "@/lib/authService";
import { tenantService } from "@/lib/tenantService";
import {
  Building2,
  ArrowRight,
  Plus,
  Globe,
  Calendar,
  Share2,
  Facebook,
  Instagram,
  ExternalLink,
} from "lucide-react";
import { socialMediaService } from "@/lib/socialMediaService";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [socialConfigs, setSocialConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = authService.getCurrentUser();
      setUser(userData);

      // Load tenants
      const tenantsData = await tenantService.getMyTenants();
      console.log("Tenants data:", tenantsData);
      setTenants(tenantsData.tenants || []);

      // Load user's social media configs
      try {
        const socialData = await socialMediaService.getConfigs({
          scope: "user",
        });
        setSocialConfigs(socialData.configs || socialData || []);
      } catch (err) {
        console.log("Could not load social media configs:", err);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Welcome back, {user?.full_name || "User"}!
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                }}
              >
                Select a tenant website to manage articles and content
              </p>

              {/* Tenants Overview */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  Your Websites
                </h2>
                <Link href="/dashboard/tenants/new">
                  <button className="btn btn-primary">
                    <Plus size={20} />
                    Register New Tenant
                  </button>
                </Link>
              </div>

              {tenants.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <Building2
                    size={64}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1.5rem",
                    }}
                  />
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No Tenants Yet
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "2rem",
                      maxWidth: "500px",
                      margin: "0 auto 2rem",
                    }}
                  >
                    Register your first website tenant to start managing
                    articles and content. Each tenant is a separate website with
                    its own dashboard and articles.
                  </p>
                  <Link href="/dashboard/tenants/new">
                    <button className="btn btn-primary">
                      <Plus size={20} />
                      Register Your First Tenant
                    </button>
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {tenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="card"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        border: "2px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--primary-color)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      onClick={() =>
                        router.push(`/dashboard/tenants/${tenant.id}/dashboard`)
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            flexShrink: 0,
                          }}
                        >
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
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
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Globe size={14} />
                            {tenant.primary_domain}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--text-secondary)",
                              textTransform: "capitalize",
                            }}
                          >
                            {tenant.plan || "Free"} Plan
                          </span>
                          {tenant.created_at && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <Calendar size={12} />
                              {new Date(tenant.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--primary-color)",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          Open Dashboard
                          <ArrowRight size={18} />
                        </div>
                        <Link
                          href={`/dashboard/tenants/${tenant.id}/social-media`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            color: "#1877F2",
                            fontWeight: 500,
                            fontSize: "0.8rem",
                            textDecoration: "none",
                          }}
                        >
                          <Share2 size={15} />
                          Social Media
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Card */}
              {tenants.length > 0 && (
                <>
                  {/* My Social Media Accounts Section */}
                  <div style={{ marginTop: "2.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Share2 size={24} />
                        My Social Media Accounts
                      </h2>
                    </div>

                    {socialConfigs.length === 0 ? (
                      <div
                        className="card"
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        <Share2
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
                          No Social Media Accounts Connected
                        </h3>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            marginBottom: "1rem",
                            maxWidth: "500px",
                            margin: "0 auto 1rem",
                          }}
                        >
                          Connect your Facebook or Instagram accounts to enable
                          automated social media posting. Go to any
                          tenant&apos;s Social Media page to connect accounts.
                        </p>
                        {tenants.length > 0 && (
                          <Link
                            href={`/dashboard/tenants/${tenants[0].id}/social-media`}
                          >
                            <button className="btn btn-primary">
                              <Share2 size={18} />
                              Connect Social Media
                            </button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        {socialConfigs.map((config) => {
                          const platformIcon =
                            config.platform === "instagram" ? (
                              <Instagram size={24} />
                            ) : (
                              <Facebook size={24} />
                            );
                          const platformColor =
                            config.platform === "instagram"
                              ? "#E4405F"
                              : config.platform === "facebook_page"
                                ? "#1877F2"
                                : "#1877F2";

                          return (
                            <div
                              key={config.id}
                              className="card"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1.25rem",
                              }}
                            >
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "12px",
                                  background: platformColor,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  flexShrink: 0,
                                }}
                              >
                                {platformIcon}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "0.95rem",
                                    marginBottom: "0.15rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {config.page_name ||
                                    config.account_name ||
                                    config.platform}
                                </h4>
                                <p
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {config.platform.replace("_", " ")}
                                  {config.is_active && (
                                    <span
                                      style={{
                                        marginLeft: "0.5rem",
                                        color: "#22c55e",
                                        fontWeight: 600,
                                      }}
                                    >
                                      ● Active
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tip Card */}
                  <div
                    className="card"
                    style={{
                      marginTop: "2rem",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                      }}
                    >
                      💡 Tip: Tenant-Specific Dashboards
                    </h3>
                    <p style={{ opacity: 0.9 }}>
                      Each tenant has its own separate dashboard where you can
                      create and manage articles specific to that website. Click
                      on any tenant above to access its dedicated dashboard.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

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
  Lightbulb,
  FileText,
  Users,
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
      const tenantsData = await tenantService.getMyTenants();
      setTenants(tenantsData.tenants || []);
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const STAT_CARDS = [
    { label: "Websites", value: tenants.length, icon: Globe, color: "#6366f1" },
    {
      label: "Social accounts",
      value: socialConfigs.length,
      icon: Share2,
      color: "#8b5cf6",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
            }}
          >
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ maxWidth: "1100px" }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: "2rem" }}>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                {greeting()}, {user?.full_name?.split(" ")[0] || "there"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Here&apos;s an overview of your content platform.
              </p>
            </div>

            {/* ── Stats row ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  style={{
                    background: "white",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-color)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "0.75rem",
                      background: `${color}14`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        lineHeight: 1.1,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Websites section ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Your websites
              </h2>
              <Link
                href="/dashboard/tenants/new"
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 1rem",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={15} /> Add website
                </button>
              </Link>
            </div>

            {tenants.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3.5rem 2rem",
                  background: "white",
                  borderRadius: "1rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "1rem",
                    background: "#6366f114",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  <Building2 size={28} color="#6366f1" />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  No websites yet
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    maxWidth: "420px",
                    margin: "0 auto 1.5rem",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  Register your first website to start generating and publishing
                  articles. Each website gets its own dashboard.
                </p>
                <Link
                  href="/dashboard/tenants/new"
                  style={{ textDecoration: "none" }}
                >
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.5rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                    }}
                  >
                    <Plus size={16} /> Register your first website
                  </button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "1rem",
                }}
              >
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    style={{
                      background: "white",
                      borderRadius: "1rem",
                      border: "1px solid var(--border-color)",
                      padding: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(99,102,241,0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() =>
                      router.push(`/dashboard/tenants/${tenant.id}/dashboard`)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.875rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "0.75rem",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                            marginBottom: "0.125rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {tenant.name}
                        </h3>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Globe size={12} /> {tenant.primary_domain}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "0.875rem",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            textTransform: "capitalize",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          {tenant.plan || "Free"} plan
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
                            <Calendar size={11} />
                            {new Date(tenant.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          color: "#6366f1",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        Open <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Social media section ── */}
            {tenants.length > 0 && (
              <div style={{ marginTop: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Share2 size={18} /> Connected social accounts
                </h2>

                {socialConfigs.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2.5rem 2rem",
                      background: "white",
                      borderRadius: "1rem",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "0.875rem",
                        background: "#6366f114",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <Share2 size={22} color="#6366f1" />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.0625rem",
                        fontWeight: 700,
                        marginBottom: "0.375rem",
                      }}
                    >
                      No accounts connected
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        maxWidth: "420px",
                        margin: "0 auto 1.25rem",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Connect Facebook or Instagram to auto-publish content from
                      any of your websites.
                    </p>
                    <Link
                      href={`/dashboard/tenants/${tenants[0].id}/social-media`}
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.5rem 1.25rem",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Share2 size={14} /> Connect accounts
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {socialConfigs.map((config) => {
                      const isIG = config.platform === "instagram";
                      const platformColor = isIG ? "#E4405F" : "#1877F2";
                      const PlatformIcon = isIG ? Instagram : Facebook;
                      return (
                        <div
                          key={config.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.875rem",
                            background: "white",
                            borderRadius: "0.875rem",
                            border: "1px solid var(--border-color)",
                            padding: "1.125rem 1.25rem",
                          }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "0.625rem",
                              background: platformColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            <PlatformIcon size={20} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                marginBottom: "0.1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {config.page_name ||
                                config.account_name ||
                                config.platform}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                textTransform: "capitalize",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                              }}
                            >
                              {config.platform.replace("_", " ")}
                              {config.is_active && (
                                <span
                                  style={{
                                    color: "#22c55e",
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  ● Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Tip banner ── */}
            {tenants.length > 0 && (
              <div
                style={{
                  marginTop: "2rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "1rem",
                  padding: "1.5rem 1.75rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  color: "white",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Lightbulb size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tip: Tenant dashboards
                  </div>
                  <p
                    style={{
                      opacity: 0.85,
                      fontSize: "0.85rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Each website has its own dashboard where you can create
                    articles, manage categories, and configure publishing. Click
                    any website card above to jump in.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

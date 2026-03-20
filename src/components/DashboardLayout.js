import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";
import {
  LayoutDashboard,
  FileText,
  Building2,
  FolderTree,
  LogOut,
  Menu,
  X,
  User,
  Mail,
  UserCircle,
  Calendar,
  ChevronDown,
  Settings,
  CreditCard,
  Link2,
  ShieldCheck,
  Users,
  ClipboardList,
  BarChart2,
  PieChart,
  DollarSign,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load cached user immediately
    const cachedUser = authService.getCurrentUser();
    setUser(cachedUser);

    // Fetch fresh user data from API
    authService.fetchCurrentUser().then((freshUser) => {
      if (freshUser) {
        setUser(freshUser);
      }
    });
  }, []);

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuOpen && !e.target.closest(".sidebar-account-container")) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [accountMenuOpen]);

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Articles", href: "/dashboard/articles" },
    { icon: Calendar, label: "Scheduling", href: "/dashboard/scheduling" },
    { icon: Building2, label: "Tenants", href: "/dashboard/tenants" },
    { icon: FolderTree, label: "Categories", href: "/dashboard/categories" },
    { icon: Mail, label: "Messages", href: "/dashboard/messages" },
    {
      icon: Link2,
      label: "Affiliate Links",
      href: "/dashboard/affiliate-links",
    },
    {
      icon: CreditCard,
      label: "Subscription",
      href: "/dashboard/subscription",
    },
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
  ];

  const adminMenuItems = [
    { icon: ShieldCheck, label: "Admin Dashboard", href: "/admin" },
    { icon: BarChart2, label: "Platform Insights", href: "/admin/insights" },
    {
      icon: PieChart,
      label: "Content Analytics",
      href: "/admin/content-analytics",
    },
    {
      icon: DollarSign,
      label: "Revenue Analytics",
      href: "/admin/revenue-analytics",
    },
    { icon: Building2, label: "All Tenants", href: "/admin/tenants" },
    { icon: Users, label: "All Users", href: "/admin/users" },
    {
      icon: ClipboardList,
      label: "Audit Logs",
      href: "/admin/audit-logs",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface)",
      }}
    >
      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        style={{
          width: sidebarOpen ? "250px" : "0",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "var(--text-primary)",
          color: "white",
          transition: "width 0.3s",
          overflow: "hidden",
          zIndex: 1000,
          opacity: mounted ? 1 : 0,
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "2rem",
            }}
          >
            PopArticle
          </h2>

          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                router.pathname === item.href ||
                router.pathname.startsWith(item.href + "/");

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.375rem",
                      marginBottom: "0.5rem",
                      background: isActive
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isActive
                        ? "rgba(255,255,255,0.1)"
                        : "transparent")
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Admin Section — visible only to global admins */}
          {user?.is_super_admin && (
            <nav style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                  padding: "0 1rem",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <ShieldCheck size={12} />
                Global Admin
              </div>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                // For /admin root, only match exactly to avoid highlighting on sub-pages
                const isActive =
                  item.href === "/admin"
                    ? router.pathname === "/admin"
                    : router.pathname === item.href ||
                      router.pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.65rem 1rem",
                        borderRadius: "0.375rem",
                        marginBottom: "0.3rem",
                        background: isActive
                          ? "rgba(220,38,38,0.25)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        borderLeft: isActive
                          ? "2px solid #fca5a5"
                          : "2px solid transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(220,38,38,0.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isActive
                          ? "rgba(220,38,38,0.25)"
                          : "transparent")
                      }
                    >
                      <Icon size={18} />
                      <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Section */}
          <div
            className="sidebar-account-container"
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1rem",
              right: "1rem",
            }}
          >
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.375rem",
                marginBottom: "0.5rem",
                border: "none",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              <div
                suppressHydrationWarning
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt=""
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(255,255,255,0.3)",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(user?.full_name || user?.username || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.full_name || user?.username || "User"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.email || ""}
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    flexShrink: 0,
                    transform: accountMenuOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
            </button>

            {/* Account Details Popup */}
            {accountMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 0.25rem)",
                  left: 0,
                  right: 0,
                  background: "white",
                  borderRadius: "0.5rem",
                  boxShadow: "0 -4px 20px rgba(0,0,0,0.25)",
                  overflow: "hidden",
                  animation: "slideIn 0.15s ease-out",
                  zIndex: 1100,
                }}
              >
                {/* User Card */}
                <div
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt=""
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border-color)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {(user?.full_name || user?.username || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <div style={{ overflow: "hidden" }}>
                    {user?.full_name && (
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {user.full_name}
                      </div>
                    )}
                    {user?.username && (
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        @{user.username}
                      </div>
                    )}
                    {user?.email && (
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.email}
                      </div>
                    )}
                    {user?.role && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.3rem",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.1rem 0.5rem",
                          borderRadius: "9999px",
                          background: "#dbeafe",
                          color: "#1e40af",
                        }}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Links */}
                <div style={{ padding: "0.375rem 0" }}>
                  <Link href="/dashboard/profile">
                    <div
                      style={{
                        padding: "0.5rem 1rem",
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--surface)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Settings size={15} />
                      Profile Settings
                    </div>
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "var(--danger-color)",
                border: "none",
                borderRadius: "0.375rem",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            padding: "1rem",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div
              suppressHydrationWarning
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {(user?.full_name || user?.username || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <span>
                {user?.full_name || user?.username || user?.email || ""}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "2rem" }}>{children}</main>
      </div>
    </div>
  );
}

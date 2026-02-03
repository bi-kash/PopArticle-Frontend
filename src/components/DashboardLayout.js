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
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = authService.getCurrentUser();
    setUser(userData);
  }, []);

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
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
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

          {/* User Section */}
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1rem",
              right: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.375rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                suppressHydrationWarning
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <User size={16} />
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  {user?.full_name || "User"}
                </span>
              </div>
              <span
                suppressHydrationWarning
                style={{ fontSize: "0.75rem", opacity: 0.7 }}
              >
                {user?.email || ""}
              </span>
            </div>

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
              style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
            >
              {user?.email || ""}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "2rem" }}>{children}</main>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";
import siteConfig from "@/lib/siteConfig";
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
  Key,
  ChevronRight,
  Rocket,
  Server,
} from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────── */
function UserAvatar({ user, size = 32, fontSize = "0.7rem" }) {
  if (user?.profile_image) {
    return (
      <img
        src={user.profile_image}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  const initials = (user?.full_name || user?.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--primary-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── component ────────────────────────────────────────────── */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const cachedUser = authService.getCurrentUser();
    setUser(cachedUser);
    authService.fetchCurrentUser().then((freshUser) => {
      if (freshUser) setUser(freshUser);
    });
  }, []);

  // close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

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
    { icon: Key, label: "API Keys", href: "/dashboard/credentials" },
    { icon: Rocket, label: "Templates", href: "/dashboard/templates" },
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
    { icon: Mail, label: "Platform Messages", href: "/admin/messages" },
    { icon: Building2, label: "All Tenants", href: "/admin/tenants" },
    { icon: Users, label: "All Users", href: "/admin/users" },
    { icon: ClipboardList, label: "Audit Logs", href: "/admin/audit-logs" },
    { icon: Server, label: "Vercel / Templates", href: "/admin/vercel" },
  ];

  const isActive = (href) =>
    href === "/dashboard"
      ? router.pathname === "/dashboard"
      : router.pathname === href || router.pathname.startsWith(href + "/");

  return (
    <>
      <style>{`
        /* ── layout tokens ─────────────────── */
        :root {
          --sidebar-w: 256px;
          --header-h: 56px;
        }

        /* ── sidebar ───────────────────────── */
        .dl-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--background);
          border-right: 1px solid var(--border-color);
          display: flex; flex-direction: column;
          z-index: 1000;
          transition: transform 0.25s cubic-bezier(.4,0,.2,1);
        }
        .dl-sidebar-brand {
          height: var(--header-h);
          display: flex; align-items: center;
          padding: 0 1.25rem;
          font-weight: 700; font-size: 1.05rem;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .dl-sidebar-nav { flex: 1; overflow-y: auto; padding: 0.75rem 0.75rem; }
        .dl-nav-group-label {
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-secondary); opacity: 0.7;
          padding: 0.75rem 0.75rem 0.35rem;
        }
        .dl-nav-item {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.55rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          margin-bottom: 2px;
          cursor: pointer; border: none; background: none; width: 100%;
          text-align: left;
        }
        .dl-nav-item:hover { background: var(--surface); color: var(--text-primary); }
        .dl-nav-item.active {
          background: var(--primary-color);
          color: white;
        }
        .dl-nav-item.admin-active {
          background: #fef2f2;
          color: #dc2626;
        }
        .dl-nav-item.admin-active:hover { background: #fee2e2; }

        /* ── overlay (mobile) ──────────────── */
        .dl-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15,23,42,0.4);
          backdrop-filter: blur(4px);
          animation: dl-fade 0.2s ease;
        }
        @keyframes dl-fade { from { opacity: 0; } to { opacity: 1; } }

        /* ── header ────────────────────────── */
        .dl-header {
          position: fixed; top: 0; right: 0;
          left: var(--sidebar-w);
          height: var(--header-h);
          background: var(--background);
          border-bottom: 1px solid var(--border-color);
          display: flex; align-items: center;
          padding: 0 1.25rem;
          z-index: 100;
          transition: left 0.25s cubic-bezier(.4,0,.2,1);
        }
        .dl-header-left { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
        .dl-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          padding: 0.35rem;
          color: var(--text-primary);
          border-radius: 0.375rem;
        }
        .dl-hamburger:hover { background: var(--surface); }

        /* ── profile trigger ───────────────── */
        .dl-profile-trigger {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.625rem 0.35rem 0.35rem;
          border-radius: 0.625rem; border: 1px solid var(--border-color);
          background: var(--background); cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          position: relative;
        }
        .dl-profile-trigger:hover { background: var(--surface); border-color: #c7d2fe; }
        .dl-profile-name {
          font-size: 0.8125rem; font-weight: 600;
          color: var(--text-primary); white-space: nowrap;
          max-width: 140px; overflow: hidden; text-overflow: ellipsis;
        }
        .dl-profile-chevron {
          color: var(--text-secondary);
          transition: transform 0.2s;
        }
        .dl-profile-chevron.open { transform: rotate(180deg); }

        /* ── profile dropdown ──────────────── */
        .dl-profile-dd {
          position: absolute; top: calc(100% + 6px); right: 0;
          width: 280px;
          background: var(--background);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          box-shadow: 0 10px 32px -4px rgba(15,23,42,0.14), 0 4px 8px -2px rgba(15,23,42,0.06);
          animation: dl-dd-in 0.15s ease;
          z-index: 200;
          overflow: hidden;
        }
        @keyframes dl-dd-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dl-dd-user {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex; align-items: center; gap: 0.75rem;
        }
        .dl-dd-user-name {
          font-weight: 600; font-size: 0.875rem;
          color: var(--text-primary);
        }
        .dl-dd-user-email {
          font-size: 0.75rem; color: var(--text-secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dl-dd-role {
          display: inline-block; margin-top: 0.25rem;
          font-size: 0.65rem; font-weight: 600;
          padding: 0.125rem 0.5rem; border-radius: 9999px;
          background: #dbeafe; color: #1e40af;
        }
        .dl-dd-items { padding: 0.375rem 0; }
        .dl-dd-item {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.5rem 1rem;
          font-size: 0.8125rem; color: var(--text-primary);
          cursor: pointer; transition: background 0.12s;
          text-decoration: none; border: none; background: none; width: 100%;
          text-align: left;
        }
        .dl-dd-item:hover { background: var(--surface); }
        .dl-dd-item svg { color: var(--text-secondary); }
        .dl-dd-divider { height: 1px; background: var(--border-color); margin: 0.25rem 0; }
        .dl-dd-item.danger { color: #dc2626; }
        .dl-dd-item.danger svg { color: #dc2626; }

        /* ── main ──────────────────────────── */
        .dl-main {
          margin-left: var(--sidebar-w);
          padding-top: var(--header-h);
          min-height: 100vh;
          background: var(--surface);
          transition: margin-left 0.25s cubic-bezier(.4,0,.2,1);
        }
        .dl-main-inner {
          padding: 1.75rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── responsive ────────────────────── */
        @media (max-width: 768px) {
          .dl-sidebar { transform: translateX(-100%); }
          .dl-sidebar.open { transform: translateX(0); }
          .dl-header { left: 0; }
          .dl-hamburger { display: flex; }
          .dl-main { margin-left: 0; }
          .dl-main-inner { padding: 1.25rem 1rem; }
          .dl-profile-name { display: none; }
        }
        @media (min-width: 769px) {
          .dl-sidebar { transform: translateX(0); }
        }
      `}</style>

      <div>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="dl-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ────────────────────────── */}
        <aside
          className={`dl-sidebar${sidebarOpen ? " open" : ""}`}
          suppressHydrationWarning
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <div className="dl-sidebar-brand">{siteConfig.siteName}</div>

          <div className="dl-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className={`dl-nav-item${isActive(item.href) ? " active" : ""}`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Admin section */}
            {user?.is_super_admin && (
              <>
                <div
                  className="dl-nav-group-label"
                  style={{ marginTop: "0.5rem" }}
                >
                  <ShieldCheck
                    size={11}
                    style={{
                      display: "inline",
                      verticalAlign: "-1px",
                      marginRight: 4,
                    }}
                  />
                  Global Admin
                </div>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? router.pathname === "/admin"
                      : router.pathname === item.href ||
                        router.pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className={`dl-nav-item${active ? " admin-active" : ""}`}
                      >
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </aside>

        {/* ── Header ─────────────────────────── */}
        <header className="dl-header">
          <div className="dl-header-left">
            <button
              className="dl-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Profile – top-right */}
          <div
            ref={profileRef}
            style={{ position: "relative" }}
            suppressHydrationWarning
          >
            <button
              className="dl-profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <UserAvatar user={user} size={30} fontSize="0.65rem" />
              <span className="dl-profile-name">
                {user?.full_name || user?.username || "Account"}
              </span>
              <ChevronDown
                size={14}
                className={`dl-profile-chevron${profileOpen ? " open" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="dl-profile-dd">
                <div className="dl-dd-user">
                  <UserAvatar user={user} size={42} fontSize="0.85rem" />
                  <div style={{ overflow: "hidden" }}>
                    <div className="dl-dd-user-name">
                      {user?.full_name || user?.username || "User"}
                    </div>
                    <div className="dl-dd-user-email">{user?.email || ""}</div>
                    {user?.role && (
                      <span className="dl-dd-role">{user.role}</span>
                    )}
                  </div>
                </div>
                <div className="dl-dd-items">
                  <Link
                    href="/dashboard/profile"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="dl-dd-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserCircle size={16} />
                      Profile Settings
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/subscription"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="dl-dd-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <CreditCard size={16} />
                      Subscription
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/credentials"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="dl-dd-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Key size={16} />
                      API Keys
                    </div>
                  </Link>
                </div>
                <div className="dl-dd-divider" />
                <div className="dl-dd-items">
                  <button className="dl-dd-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main content ───────────────────── */}
        <main className="dl-main">
          <div className="dl-main-inner">{children}</div>
        </main>
      </div>
    </>
  );
}

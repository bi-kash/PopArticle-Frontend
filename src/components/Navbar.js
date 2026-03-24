import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";
import siteConfig from "@/lib/siteConfig";
import Logo from "@/components/Logo";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = authService.getCurrentUser();
    setUser(userData);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        accountDropdownOpen &&
        !e.target.closest(".account-dropdown-container")
      ) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [accountDropdownOpen]);

  const isAuthenticated = mounted && authService.isAuthenticated();
  const handleLogout = () => authService.logout();
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Contact", href: "/contact" },
  ];

  const displayName =
    user?.full_name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Account";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="site-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        background: scrolled
          ? "rgba(10, 17, 35, 0.97)"
          : "rgba(10, 17, 35, 0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
        color: "white",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.625rem 1rem",
          maxWidth: "1200px",
        }}
      >
        {/* Logo */}
        <Logo variant="light" size="default" />

        {/* Desktop Nav */}
        <nav
          suppressHydrationWarning
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.125rem",
          }}
        >
          {navLinks.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className="nav-link-item"
                  style={{
                    padding: "0.4375rem 0.875rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 450,
                    color: active ? "white" : "rgba(255,255,255,0.75)",
                    background: active
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Separator */}
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.12)",
              margin: "0 0.375rem",
            }}
          />

          {isAuthenticated ? (
            <div
              suppressHydrationWarning
              className="account-dropdown-container"
              style={{ position: "relative" }}
            >
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="nav-avatar-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  padding: "0.35rem 0.75rem 0.35rem 0.35rem",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt=""
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(255,255,255,0.15)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <span className="desktop-nav-text">{displayName}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s",
                    transform: accountDropdownOpen ? "rotate(180deg)" : "none",
                    opacity: 0.7,
                  }}
                />
              </button>

              {/* Account Dropdown */}
              {accountDropdownOpen && (
                <div
                  className="navbar-dropdown"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.625rem)",
                    right: 0,
                    background: "white",
                    borderRadius: "0.75rem",
                    boxShadow:
                      "0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)",
                    minWidth: "260px",
                    zIndex: 1200,
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    animation: "navDropIn 0.15s ease-out",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "1rem 1rem 0.875rem",
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
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--border-color)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <div style={{ overflow: "hidden", minWidth: 0 }}>
                      {user?.full_name && (
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user.full_name}
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
                            marginTop: "0.25rem",
                            fontSize: "0.675rem",
                            fontWeight: 600,
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            background: "#ede9fe",
                            color: "#6d28d9",
                            textTransform: "capitalize",
                          }}
                        >
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: "0.375rem 0" }}>
                    {[
                      {
                        href: "/dashboard",
                        label: "Dashboard",
                        icon: LayoutDashboard,
                      },
                      {
                        href: "/dashboard/profile",
                        label: "Profile Settings",
                        icon: Settings,
                      },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div
                          className="navbar-dropdown-item"
                          style={{
                            padding: "0.5rem 1rem",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            transition: "background 0.12s",
                          }}
                        >
                          <item.icon
                            size={16}
                            style={{ color: "var(--text-secondary)" }}
                          />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      padding: "0.375rem 0",
                    }}
                  >
                    <button
                      onClick={handleLogout}
                      className="navbar-dropdown-item"
                      style={{
                        width: "100%",
                        padding: "0.5rem 1rem",
                        background: "none",
                        border: "none",
                        color: "var(--danger-color)",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        transition: "background 0.12s",
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              suppressHydrationWarning
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <Link href="/login">
                <button
                  className="btn nav-link-item"
                  style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "0.4375rem 0.875rem",
                    border: "none",
                  }}
                >
                  Log In
                </button>
              </Link>
              <Link href="/register">
                <button
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    padding: "0.4375rem 1.125rem",
                    borderRadius: "0.4375rem",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  }}
                >
                  Get Started
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.5rem",
              display: "none",
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          suppressHydrationWarning
          className="mobile-menu"
          style={{
            background: "rgba(15, 23, 42, 0.98)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "1rem",
            backdropFilter: "blur(12px)",
          }}
        >
          {isAuthenticated && user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "0.625rem",
                marginBottom: "0.75rem",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt=""
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {user.full_name || user.username || "User"}
                </div>
                {user.email && (
                  <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className="nav-link-item"
                style={{
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontWeight: router.pathname === link.href ? 600 : 400,
                  color:
                    router.pathname === link.href
                      ? "white"
                      : "rgba(255,255,255,0.7)",
                  background:
                    router.pathname === link.href
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                  marginBottom: "0.125rem",
                  fontSize: "0.9rem",
                }}
              >
                {link.label}
              </div>
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.06)",
                  margin: "0.5rem 0",
                }}
              />
              <Link href="/dashboard">
                <div
                  style={{
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.125rem",
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </div>
              </Link>
              <Link href="/dashboard/profile">
                <div
                  style={{
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.125rem",
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Settings size={16} />
                  Profile
                </div>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "0.375rem",
                  color: "#fca5a5",
                  cursor: "pointer",
                  fontWeight: 500,
                  marginTop: "0.375rem",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.75rem",
              }}
            >
              <Link href="/login" style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.875rem",
                  }}
                >
                  Log In
                </button>
              </Link>
              <Link href="/register" style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Scoped styles */}
      <style jsx global>{`
        .nav-link-item:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }
        .nav-avatar-btn:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
        }
        .navbar-dropdown-item:hover {
          background: var(--surface) !important;
        }
        @keyframes navDropIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .desktop-nav > a,
        .desktop-nav > .account-dropdown-container,
        .desktop-nav > div:not(.mobile-menu-btn) {
          display: flex;
        }
        .mobile-menu-btn {
          display: none !important;
        }
        .mobile-menu {
          display: block;
        }
        @media (max-width: 768px) {
          .desktop-nav > a {
            display: none !important;
          }
          .desktop-nav > .account-dropdown-container {
            display: none !important;
          }
          .desktop-nav > div:last-child:not(.mobile-menu-btn) {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

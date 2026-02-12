import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = authService.getCurrentUser();
    setUser(userData);
  }, []);

  useEffect(() => {
    // Close dropdowns on route change
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [router.pathname]);

  // Close dropdown when clicking outside
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

  const handleLogout = () => {
    authService.logout();
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
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
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "white" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
            PopArticle
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav
          suppressHydrationWarning
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  fontWeight: router.pathname === link.href ? "600" : "400",
                  background:
                    router.pathname === link.href
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    router.pathname === link.href
                      ? "rgba(255,255,255,0.2)"
                      : "transparent")
                }
              >
                {link.label}
              </span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div
              suppressHydrationWarning
              className="account-dropdown-container"
              style={{ position: "relative", marginLeft: "0.5rem" }}
            >
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.4rem 0.75rem",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
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
                      background: "rgba(255,255,255,0.3)",
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
                <ChevronDown size={16} />
              </button>

              {/* Account Dropdown */}
              {accountDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    background: "white",
                    borderRadius: "0.5rem",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)",
                    minWidth: "280px",
                    zIndex: 1200,
                    overflow: "hidden",
                    animation: "slideIn 0.15s ease-out",
                  }}
                >
                  {/* User Info Header */}
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
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--border-color)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <div style={{ overflow: "hidden" }}>
                      {user?.full_name && (
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: "0.95rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                            marginTop: "0.25rem",
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

                  {/* Dropdown Links */}
                  <div style={{ padding: "0.5rem 0" }}>
                    <Link href="/dashboard">
                      <div
                        style={{
                          padding: "0.6rem 1rem",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/dashboard/profile">
                      <div
                        style={{
                          padding: "0.6rem 1rem",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Profile Settings
                      </div>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      padding: "0.5rem 0",
                    }}
                  >
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "0.6rem 1rem",
                        background: "none",
                        border: "none",
                        color: "var(--danger-color)",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fef2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
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
              style={{ display: "flex", gap: "0.5rem", marginLeft: "0.5rem" }}
            >
              <Link href="/login">
                <button
                  className="btn"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button
                  className="btn"
                  style={{
                    background: "white",
                    color: "#667eea",
                    fontSize: "0.9rem",
                  }}
                >
                  Sign Up
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
              display: "none", // shown via CSS media query
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          suppressHydrationWarning
          className="mobile-menu"
          style={{
            background: "rgba(102, 126, 234, 0.98)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            padding: "1rem",
          }}
        >
          {/* User info in mobile menu */}
          {isAuthenticated && user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {user.full_name || user.username || "User"}
                </div>
                {user.email && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  fontWeight: router.pathname === link.href ? "600" : "400",
                  background:
                    router.pathname === link.href
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  marginBottom: "0.25rem",
                }}
              >
                {link.label}
              </div>
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Dashboard
                </div>
              </Link>
              <Link href="/dashboard/profile">
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Profile Settings
                </div>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(239,68,68,0.9)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <LogOut size={18} />
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
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/register" style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#667eea",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx global>{`
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

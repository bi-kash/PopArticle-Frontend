import Link from "next/link";
import siteConfig from "@/lib/siteConfig";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      suppressHydrationWarning
      style={{
        background: "var(--text-primary)",
        color: "white",
        padding: "3rem 0 1.5rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Brand */}
        <div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
            }}
          >
            {siteConfig.siteName}
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            {siteConfig.description}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.9,
            }}
          >
            Quick Links
          </h4>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Link
              href="/"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Home
            </Link>
            <Link
              href="/contact"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Contact
            </Link>
            <Link
              href="/login"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Sign In
            </Link>
            <Link
              href="/register"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Sign Up
            </Link>
          </nav>
        </div>

        {/* Legal */}
        <div>
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.9,
            }}
          >
            Legal
          </h4>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Link
              href="/privacy-policy"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Terms of Service
            </Link>
            <Link
              href="/refund-policy"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: "1.5rem",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.85rem",
              margin: 0,
            }}
          >
            &copy; {currentYear} {siteConfig.copyrightHolder}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

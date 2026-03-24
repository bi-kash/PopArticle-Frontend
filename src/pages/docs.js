import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import siteConfig from "@/lib/siteConfig";
import {
  BookOpen,
  Key,
  User,
  FileText,
  Tag,
  MessageSquare,
  Users,
  Building2,
  Mail,
  Calendar,
  Share2,
  CreditCard,
  Link2,
  Shield,
  AlertCircle,
  ChevronRight,
  Copy,
  Check,
  Activity,
  Search,
} from "lucide-react";

const SECTIONS = [
  {
    id: "authentication-methods",
    label: "Auth Methods",
    icon: Key,
    color: "#6366f1",
  },
  {
    id: "authentication-endpoints",
    label: "Auth Endpoints",
    icon: Shield,
    color: "#8b5cf6",
  },
  {
    id: "oauth-endpoints",
    label: "OAuth",
    icon: Link2,
    color: "#06b6d4",
  },
  {
    id: "api-key-management",
    label: "API Keys",
    icon: Key,
    color: "#f59e0b",
  },
  {
    id: "profile-management",
    label: "Profile",
    icon: User,
    color: "#10b981",
  },
  {
    id: "message-contact-endpoints",
    label: "Messages",
    icon: MessageSquare,
    color: "#3b82f6",
  },
  {
    id: "article-endpoints",
    label: "Articles",
    icon: FileText,
    color: "#ef4444",
  },
  {
    id: "category-endpoints",
    label: "Categories",
    icon: Tag,
    color: "#f97316",
  },
  {
    id: "comment-endpoints",
    label: "Comments",
    icon: MessageSquare,
    color: "#84cc16",
  },
  {
    id: "team-management",
    label: "Team",
    icon: Users,
    color: "#ec4899",
  },
  {
    id: "tenant-management",
    label: "Tenants",
    icon: Building2,
    color: "#14b8a6",
  },
  {
    id: "invitation-endpoints",
    label: "Invitations",
    icon: Mail,
    color: "#a78bfa",
  },
  {
    id: "article-scheduling",
    label: "Scheduling",
    icon: Calendar,
    color: "#fb923c",
  },
  {
    id: "social-media-posting",
    label: "Social Media",
    icon: Share2,
    color: "#38bdf8",
  },
  {
    id: "subscription-endpoints",
    label: "Subscriptions",
    icon: CreditCard,
    color: "#4ade80",
  },
  {
    id: "affiliate-link-management",
    label: "Affiliates",
    icon: Link2,
    color: "#fbbf24",
  },
  {
    id: "system-administration",
    label: "Admin",
    icon: Shield,
    color: "#f87171",
  },
  {
    id: "health-check",
    label: "Health Check",
    icon: Activity,
    color: "#34d399",
  },
  {
    id: "error-responses",
    label: "Error Responses",
    icon: AlertCircle,
    color: "#fb7185",
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      title="Copy"
      style={{
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        background: copied ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.07)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "0.375rem",
        color: copied ? "#4ade80" : "rgba(255,255,255,0.55)",
        cursor: "pointer",
        padding: "0.3rem 0.55rem",
        fontSize: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        transition: "all 0.2s",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, lang = "http" }) {
  return (
    <div style={{ position: "relative", margin: "0.75rem 0" }}>
      <div
        style={{
          background: "#0d1117",
          borderRadius: "0.625rem",
          padding: "1rem 1rem 1rem 1.125rem",
          overflowX: "auto",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.28)",
            marginBottom: "0.5rem",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {lang}
        </div>
        <pre
          style={{
            margin: 0,
            fontFamily:
              "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
            fontSize: "0.825rem",
            color: "#e2e8f0",
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {code}
        </pre>
      </div>
      <CopyButton text={code} />
    </div>
  );
}

function Badge({ method }) {
  const colors = {
    GET: { bg: "#dcfce7", color: "#166534" },
    POST: { bg: "#dbeafe", color: "#1e40af" },
    PATCH: { bg: "#fef3c7", color: "#92400e" },
    PUT: { bg: "#ede9fe", color: "#5b21b6" },
    DELETE: { bg: "#fee2e2", color: "#991b1b" },
  };
  const c = colors[method] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.3125rem",
        letterSpacing: "0.05em",
        fontFamily: "monospace",
      }}
    >
      {method}
    </span>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: "3rem", scrollMarginTop: "5rem" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
          paddingBottom: "0.75rem",
          borderBottom: "2px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {title}
      </h2>
      <div style={{ marginTop: "1.25rem" }}>{children}</div>
    </section>
  );
}

function Endpoint({ method, path, description, request, response, notes }) {
  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        marginBottom: "1.5rem",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <Badge method={method} />
        <code
          style={{
            fontFamily: "monospace",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {path}
        </code>
        {description && (
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.825rem",
              marginLeft: "auto",
            }}
          >
            {description}
          </span>
        )}
      </div>
      <div style={{ padding: "1.25rem" }}>
        {request && (
          <>
            <p
              style={{
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 0.375rem",
              }}
            >
              Request
            </p>
            <CodeBlock code={request} lang="json" />
          </>
        )}
        {response && (
          <>
            <p
              style={{
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0.75rem 0 0.375rem",
              }}
            >
              Response
            </p>
            <CodeBlock code={response} lang="json" />
          </>
        )}
        {notes && (
          <div
            style={{
              marginTop: "0.75rem",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              color: "#0369a1",
              lineHeight: 1.6,
            }}
          >
            <strong>Notes:</strong> {notes}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("authentication-methods");
  const [search, setSearch] = useState("");

  const filteredSections = search
    ? SECTIONS.filter((s) =>
        s.label.toLowerCase().includes(search.toLowerCase()),
      )
    : SECTIONS;

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Head>
        <title>API Documentation — {siteConfig.siteName}</title>
        <meta
          name="description"
          content={`Complete REST API reference for ${siteConfig.siteName}`}
        />
      </Head>

      <Navbar />

      {/* Page hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "white",
          padding: "3rem 1rem 2.5rem",
          borderBottom: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: "1200px", textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "9999px",
              padding: "0.3rem 1rem",
              fontSize: "0.8rem",
              color: "#a5b4fc",
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            <BookOpen size={14} /> REST API Reference
          </div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              marginBottom: "0.75rem",
            }}
          >
            API Documentation
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "1.0625rem",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Complete REST API reference for the {siteConfig.siteName} platform.
            Base URL:{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "0.125rem 0.5rem",
                borderRadius: "0.25rem",
                fontFamily: "monospace",
                fontSize: "0.9em",
                color: "#a5b4fc",
              }}
            >
              http://localhost:5000
            </code>
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div
        className="container"
        style={{
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "2rem",
          padding: "2rem 1rem",
          alignItems: "start",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            position: "sticky",
            top: "5rem",
            background: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "0.875rem",
            padding: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            maxHeight: "calc(100vh - 7rem)",
            overflowY: "auto",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "0.625rem",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4375rem 0.5rem 0.4375rem 2rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.375rem",
                  fontSize: "0.8rem",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-secondary)",
              margin: "0.75rem 0 0.375rem 0.25rem",
            }}
          >
            Endpoints
          </p>
          {filteredSections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.4375rem 0.625rem",
                  borderRadius: "0.425rem",
                  background: isActive ? `${s.color}14` : "transparent",
                  border: isActive
                    ? `1px solid ${s.color}33`
                    : "1px solid transparent",
                  color: isActive ? s.color : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.8375rem",
                  fontWeight: isActive ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.125rem",
                  transition: "all 0.12s",
                }}
              >
                <Icon size={13} style={{ flexShrink: 0, color: s.color }} />
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <main style={{ minWidth: 0 }}>
          {/* ── Auth Methods ── */}
          <Section id="authentication-methods" title="Authentication Methods">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                {
                  title: "JWT Bearer Token",
                  code: "Authorization: Bearer <access_token>",
                  note: "Access tokens expire in 1 hour. Refresh tokens expire in 30 days.",
                  color: "#6366f1",
                },
                {
                  title: "API Key",
                  code: "X-API-Key: pa_your_api_key_here",
                  note: "Use for server-to-server integrations. Keys are shown only once on creation.",
                  color: "#f59e0b",
                },
                {
                  title: "Tenant Context",
                  code: "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000",
                  note: "Optional. Scopes requests to a specific tenant workspace.",
                  color: "#10b981",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: `${item.color}0d`,
                      borderBottom: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: item.color,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div style={{ padding: "0.875rem 1rem" }}>
                    <CodeBlock code={item.code} lang="http" />
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        margin: "0.5rem 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Auth Endpoints ── */}
          <Section
            id="authentication-endpoints"
            title="Authentication Endpoints"
          >
            <Endpoint
              method="POST"
              path="/api/v1/auth/register"
              description="Register a new user"
              request={`{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "full_name": "John Doe"
}`}
              response={`// 201 Created
{
  "message": "User registered successfully",
  "user": { "id": 1, "email": "user@example.com", ... },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer"
}`}
              notes="Without X-Tenant-ID creates a platform admin user. With X-Tenant-ID creates a tenant-scoped user. Password must be at least 8 characters."
            />
            <Endpoint
              method="POST"
              path="/api/v1/auth/login"
              description="Authenticate and get tokens"
              request={`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}
              response={`// 200 OK
{
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com", ... },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer"
}`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/auth/refresh"
              description="Refresh access token"
              request={`{
  "refresh_token": "eyJhbGci..."
}`}
              response={`// 200 OK
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer"
}`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/auth/me"
              description="Get current authenticated user"
              response={`// 200 OK
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "Admin",
    "is_platform_admin": false,
    "tenant_id": "550e8400-...",
    "created_at": "2025-01-01T00:00:00.000000"
  }
}`}
            />
          </Section>

          {/* ── OAuth ── */}
          <Section id="oauth-endpoints" title="OAuth Endpoints">
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "0.625rem",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "#0369a1",
              }}
            >
              <strong>Supported Providers:</strong>{" "}
              {["google", "github", "linkedin", "facebook"].map((p) => (
                <code
                  key={p}
                  style={{
                    background: "rgba(3,105,161,0.1)",
                    padding: "0.125rem 0.4rem",
                    borderRadius: "0.25rem",
                    marginLeft: "0.375rem",
                    fontFamily: "monospace",
                  }}
                >
                  {p}
                </code>
              ))}
            </div>
            <Endpoint
              method="GET"
              path="/api/v1/auth/oauth/{provider}"
              description="Initiate OAuth flow — redirects to provider"
            />
            <Endpoint
              method="GET"
              path="/api/v1/auth/oauth/{provider}/callback"
              description="OAuth callback — handled automatically"
              notes="On success redirects to: {FRONTEND_URL}/oauth/callback?access_token=...&refresh_token=... — Creates new user if email doesn't exist; links to existing account if it does."
            />
          </Section>

          {/* ── API Keys ── */}
          <Section id="api-key-management" title="API Key Management">
            <Endpoint
              method="GET"
              path="/api/v1/auth/api-keys"
              description="List all API keys"
              response={`// 200 OK
{
  "api_keys": [
    {
      "id": 1,
      "name": "My Production Key",
      "prefix": "pa_123456",
      "is_active": true,
      "request_count": 42,
      "last_used_at": "2025-01-01T12:00:00.000000"
    }
  ]
}`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/auth/api-keys"
              description="Create a new API key"
              request={`{ "name": "My Production Key" }`}
              response={`// 201 Created
{
  "message": "API key created successfully",
  "api_key": "pa_1234567890abcdef...",
  "prefix": "pa_123456",
  "warning": "Save this key securely. You will not be able to see it again."
}`}
              notes="The full API key is only shown once on creation. Store it securely."
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/auth/api-keys/{key_id}"
              description="Delete an API key"
              response={`// 200 OK\n{ "message": "API key deleted successfully" }`}
            />
          </Section>

          {/* ── Profile ── */}
          <Section id="profile-management" title="Profile Management">
            <Endpoint
              method="PATCH"
              path="/api/v1/auth/profile"
              description="Update user profile (all fields optional)"
              request={`{
  "full_name": "John Doe",
  "username": "johndoe",
  "profile_image": "https://example.com/profile.jpg"
}`}
              response={`// 200 OK
{
  "message": "Profile updated successfully",
  "user": { "id": 1, "email": "...", "username": "johndoe", ... }
}`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/auth/change-password"
              description="Change user password"
              request={`{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}`}
              response={`// 200 OK\n{ "message": "Password changed successfully" }`}
            />
          </Section>

          {/* ── Messages ── */}
          <Section
            id="message-contact-endpoints"
            title="Message / Contact Endpoints"
          >
            <Endpoint
              method="POST"
              path="/api/v1/contact"
              description="Submit a contact message"
              request={`{
  "name": "John Doe",
  "email": "user@example.com",
  "subject": "Question about API",
  "message": "How do I get an API key?"
}`}
              response={`// 201 Created\n{ "message": "Message sent successfully" }`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/messages"
              description="List messages (authenticated)"
              response={`// 200 OK
{
  "messages": [
    {
      "id": 1,
      "subject": "Welcome",
      "body": "...",
      "sender": { "id": 2, "full_name": "Admin" },
      "read": false,
      "created_at": "2025-01-01T00:00:00.000000"
    }
  ]
}`}
            />
          </Section>

          {/* ── Articles ── */}
          <Section id="article-endpoints" title="Article Endpoints">
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/articles"
              description="List articles for a tenant"
              response={`// 200 OK
{
  "articles": [
    {
      "id": 1,
      "title": "My Article",
      "slug": "my-article",
      "status": "published",
      "category_id": 2,
      "created_at": "2025-01-01T00:00:00.000000"
    }
  ],
  "total": 1, "page": 1, "per_page": 20
}`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/articles"
              description="Create a new article"
              request={`{
  "title": "My Article",
  "content": "Article body in markdown...",
  "category_id": 1,
  "status": "draft"
}`}
              response={`// 201 Created\n{ "article": { "id": 1, "title": "My Article", ... } }`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}"
              description="Get a single article"
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}"
              description="Update an article"
              request={`{ "title": "Updated Title", "status": "published" }`}
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}"
              description="Delete an article"
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/articles/generate"
              description="Generate article with AI"
              request={`{
  "prompt": "Write about the future of AI in content creation",
  "category_id": 1,
  "tone": "professional",
  "length": "medium"
}`}
              response={`// 201 Created
{
  "article": {
    "id": 5,
    "title": "The Future of AI in Content Creation",
    "content": "...",
    "status": "draft"
  }
}`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/articles/search"
              description="Search articles"
              request={`// Query params: ?q=keyword&status=published&category_id=1`}
            />
          </Section>

          {/* ── Categories ── */}
          <Section id="category-endpoints" title="Category Endpoints">
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/categories"
              description="List all categories"
              response={`// 200 OK\n{ "categories": [{ "id": 1, "name": "Tech", "slug": "tech", "description": "...", "article_count": 5 }] }`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/categories"
              description="Create a category"
              request={`{ "name": "Technology", "slug": "technology", "description": "Tech articles" }`}
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/tenants/{tenant_id}/categories/{category_id}"
              description="Update a category"
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}/categories/{category_id}"
              description="Delete a category"
            />
          </Section>

          {/* ── Comments ── */}
          <Section id="comment-endpoints" title="Comment Endpoints">
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}/comments"
              description="List comments on an article"
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}/comments"
              description="Post a comment"
              request={`{ "content": "Great article!" }`}
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}/comments/{comment_id}"
              description="Delete a comment"
            />
          </Section>

          {/* ── Team ── */}
          <Section id="team-management" title="Team Management">
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/team"
              description="List team members"
              response={`// 200 OK\n{ "members": [{ "id": 1, "full_name": "Jane", "role": "Editor", "email": "..." }] }`}
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/tenants/{tenant_id}/team/{user_id}"
              description="Update member role"
              request={`{ "role": "Editor" }`}
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}/team/{user_id}"
              description="Remove a team member"
            />
          </Section>

          {/* ── Tenants ── */}
          <Section id="tenant-management" title="Tenant Management">
            <Endpoint
              method="GET"
              path="/api/v1/tenants"
              description="List tenants for current user"
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants"
              description="Create a new tenant"
              request={`{
  "name": "My Blog",
  "slug": "my-blog",
  "domain": "myblog.com",
  "description": "A personal tech blog"
}`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}"
              description="Get tenant details"
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/tenants/{tenant_id}"
              description="Update tenant"
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}"
              description="Delete tenant"
            />
          </Section>

          {/* ── Invitations ── */}
          <Section id="invitation-endpoints" title="Invitation Endpoints">
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/invitations"
              description="Invite a user to a tenant"
              request={`{ "email": "newuser@example.com", "role": "Editor" }`}
              response={`// 201 Created\n{ "message": "Invitation sent", "invitation_token": "abc123..." }`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/invitations/accept"
              description="Accept an invitation"
              request={`{ "token": "abc123..." }`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/invitations"
              description="List pending invitations"
            />
          </Section>

          {/* ── Scheduling ── */}
          <Section id="article-scheduling" title="Article Scheduling">
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}/schedule"
              description="Schedule article for publishing"
              request={`{
  "scheduled_at": "2025-06-01T09:00:00Z",
  "timezone": "America/New_York"
}`}
              response={`// 200 OK\n{ "message": "Article scheduled", "scheduled_at": "2025-06-01T09:00:00Z" }`}
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}/schedule"
              description="Cancel scheduled publishing"
            />
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/scheduled"
              description="List all scheduled articles"
            />
          </Section>

          {/* ── Social Media ── */}
          <Section id="social-media-posting" title="Social Media Posting">
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/social-accounts"
              description="List connected social media accounts"
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/articles/{article_id}/publish-social"
              description="Post article to social media"
              request={`{
  "platforms": ["twitter", "linkedin"],
  "custom_message": "Check out our latest article!",
  "schedule_at": null
}`}
            />
          </Section>

          {/* ── Subscriptions ── */}
          <Section id="subscription-endpoints" title="Subscription Endpoints">
            <Endpoint
              method="GET"
              path="/api/v1/subscriptions/plans"
              description="List available subscription plans"
              response={`// 200 OK\n{ "plans": [{ "id": "pro", "name": "Pro", "price": 29, "features": [...] }] }`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/subscriptions/current"
              description="Get current subscription"
            />
            <Endpoint
              method="POST"
              path="/api/v1/subscriptions"
              description="Create / upgrade subscription"
              request={`{ "plan_id": "pro", "payment_method_id": "pm_xxx" }`}
            />
            <Endpoint
              method="DELETE"
              path="/api/v1/subscriptions/cancel"
              description="Cancel subscription"
            />
          </Section>

          {/* ── Affiliates ── */}
          <Section
            id="affiliate-link-management"
            title="Affiliate Link Management"
          >
            <Endpoint
              method="GET"
              path="/api/v1/tenants/{tenant_id}/affiliate-links"
              description="List affiliate links"
            />
            <Endpoint
              method="POST"
              path="/api/v1/tenants/{tenant_id}/affiliate-links"
              description="Create an affiliate link"
              request={`{
  "name": "Amazon Affiliate",
  "original_url": "https://amazon.com/product/123",
  "slug": "amz-product"
}`}
            />
            <Endpoint
              method="GET"
              path="/r/{slug}"
              description="Affiliate redirect — tracks click and redirects"
            />
          </Section>

          {/* ── Admin ── */}
          <Section
            id="system-administration"
            title="System Administration (Global Admin)"
          >
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "0.625rem",
                padding: "0.875rem 1.125rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "#c2410c",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <AlertCircle
                size={16}
                style={{ marginTop: "0.0625rem", flexShrink: 0 }}
              />
              <span>
                All admin endpoints require{" "}
                <code
                  style={{
                    background: "rgba(194,65,12,0.1)",
                    padding: "0.0625rem 0.3rem",
                    borderRadius: "0.25rem",
                    fontFamily: "monospace",
                  }}
                >
                  is_platform_admin: true
                </code>{" "}
                on the user account.
              </span>
            </div>
            <Endpoint
              method="GET"
              path="/api/v1/admin/dashboard"
              description="Platform overview — user counts, revenue, active tenants"
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/insights"
              description="Platform insights and growth metrics"
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/analytics/content"
              description="Content analytics across all tenants"
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/analytics/revenue"
              description="Revenue analytics and subscription breakdown"
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/tenants"
              description="List all tenants"
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/admin/tenants/{tenant_id}"
              description="Update tenant settings"
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/users"
              description="List all users"
            />
            <Endpoint
              method="PATCH"
              path="/api/v1/admin/users/{user_id}/role"
              description="Update user platform role"
              request={`{ "is_platform_admin": true }`}
            />
            <Endpoint
              method="GET"
              path="/api/v1/admin/audit-logs"
              description="Get audit logs"
              response={`// 200 OK\n{ "logs": [{ "id": 1, "action": "user.login", "user_id": 1, "ip": "127.0.0.1", "created_at": "..." }] }`}
            />
          </Section>

          {/* ── Health Check ── */}
          <Section id="health-check" title="Health Check">
            <Endpoint
              method="GET"
              path="/health"
              description="Server health check"
              response={`// 200 OK\n{ "status": "healthy", "version": "1.0.0", "db": "connected" }`}
            />
          </Section>

          {/* ── Error Responses ── */}
          <Section id="error-responses" title="Error Responses">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  code: 400,
                  label: "Bad Request",
                  desc: "Invalid request body or parameters",
                },
                {
                  code: 401,
                  label: "Unauthorized",
                  desc: "Missing or invalid authentication token",
                },
                {
                  code: 403,
                  label: "Forbidden",
                  desc: "Insufficient permissions for this action",
                },
                {
                  code: 404,
                  label: "Not Found",
                  desc: "Resource does not exist",
                },
                {
                  code: 409,
                  label: "Conflict",
                  desc: "Resource already exists (e.g. duplicate email)",
                },
                {
                  code: 422,
                  label: "Unprocessable",
                  desc: "Validation failed for request data",
                },
                {
                  code: 429,
                  label: "Rate Limited",
                  desc: "Too many requests — slow down",
                },
                {
                  code: 500,
                  label: "Server Error",
                  desc: "Internal server error",
                },
              ].map((e) => (
                <div
                  key={e.code}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.625rem",
                    padding: "0.875rem 1rem",
                    background: "white",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color:
                        e.code >= 500
                          ? "#dc2626"
                          : e.code >= 400
                            ? "#d97706"
                            : "#16a34a",
                      fontFamily: "monospace",
                      minWidth: "2.8rem",
                    }}
                  >
                    {e.code}
                  </span>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {e.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.125rem",
                      }}
                    >
                      {e.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                }}
              >
                Standard Error Response Format
              </p>
              <CodeBlock
                code={`{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "status": 401
}`}
                lang="json"
              />
            </div>
          </Section>
        </main>
      </div>

      <Footer />

      <style jsx global>{`
        @media (max-width: 768px) {
          .docs-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

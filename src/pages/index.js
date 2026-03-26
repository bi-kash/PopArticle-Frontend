import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { authService } from "@/lib/authService";
import siteConfig from "@/lib/siteConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  Globe,
  Zap,
  BarChart3,
  Users,
  Shield,
  Clock,
  PenTool,
  Layers,
  ArrowRight,
  Star,
  Check,
  FileText,
  Calendar,
  Share2,
  Bot,
  CheckCircle2,
  ChevronRight,
  Crown,
} from "lucide-react";

/* ───────── small reusable pieces ───────── */

const FEATURES = [
  {
    icon: Bot,
    title: "AI Article Generation",
    desc: "Generate SEO-optimized, publish-ready articles in seconds. Choose topics, tone, and length — our AI handles the rest.",
    color: "#8b5cf6",
  },
  {
    icon: PenTool,
    title: "Rich & Markdown Editors",
    desc: "Write in a WYSIWYG HTML editor or switch to Markdown — whatever fits your workflow. Full formatting support included.",
    color: "#2563eb",
  },
  {
    icon: Globe,
    title: "Multi-Tenant Websites",
    desc: "Run multiple blogs or client sites from a single dashboard. Each tenant gets its own categories, articles, and team.",
    color: "#0891b2",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Schedule articles ahead of time and publish them automatically. Plan weeks of content in minutes.",
    color: "#059669",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track article performance, engagement, and growth with built-in analytics. Know what resonates with your audience.",
    color: "#d97706",
  },
  {
    icon: Share2,
    title: "Social Media Integration",
    desc: "Distribute content across social channels directly from the platform. Amplify reach without leaving your dashboard.",
    color: "#e11d48",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Invite editors, writers, and admins. Assign roles and manage your content team with granular permissions.",
    color: "#7c3aed",
  },
  {
    icon: Shield,
    title: "SEO Metadata & Slugs",
    desc: "Auto-generated slugs, meta titles, descriptions, and keyword suggestions ensure every article is search-engine ready.",
    color: "#0284c7",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create Your Workspace",
    desc: "Sign up free and register your first tenant site in under a minute.",
  },
  {
    num: "02",
    title: "Generate or Write Content",
    desc: "Use AI to draft articles instantly, or write your own using our powerful editors.",
  },
  {
    num: "03",
    title: "Publish & Grow",
    desc: "Schedule, publish, and share content across channels. Watch your audience grow.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Marketing Lead",
    text: "This platform cut our content production time by 70%. We went from 4 articles a week to 4 a day — without sacrificing quality.",
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Agency Owner",
    text: "The multi-tenant feature is a game-changer. I manage 12 client blogs from one dashboard. My team loves it.",
    avatar: "MR",
  },
  {
    name: "Aisha Patel",
    role: "Solo Blogger",
    text: "I was skeptical about AI writing, but the output is genuinely impressive. It understands context and tone perfectly.",
    avatar: "AP",
  },
];

const STATS = [
  { value: "50K+", label: "Articles Generated" },
  { value: "2,500+", label: "Active Users" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "< 30s", label: "Avg. Generation Time" },
];

/* ───────── page ───────── */

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>{siteConfig.siteName} — AI-Powered Content Platform</title>
        <meta
          name="description"
          content="Generate, manage, and publish high-quality articles with AI. Multi-tenant support, scheduling, SEO tools, and team collaboration — all in one platform."
        />
      </Head>

      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Navbar />

        <main style={{ flex: 1 }}>
          {/* ===================== HERO ===================== */}
          <section
            className="homepage-hero"
            style={{
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
              color: "white",
              padding: "6rem 1rem 5rem",
            }}
          >
            {/* decorative blobs */}
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />

            <div
              className="container"
              style={{
                position: "relative",
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "3rem",
                alignItems: "center",
                maxWidth: "1100px",
                textAlign: "center",
              }}
            >
              <div>
                {/* trust badge */}
                <div
                  className="hero-fade-in"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "999px",
                    padding: "0.375rem 1rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "#c4b5fd",
                    marginBottom: "1.75rem",
                  }}
                >
                  <Sparkles size={14} />
                  Trusted by 2,500+ content creators
                </div>

                <h1
                  className="hero-fade-in"
                  style={{
                    fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: "1.5rem",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Create Stunning Content{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #818cf8, #c084fc, #f472b6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    10x Faster
                  </span>{" "}
                  with AI
                </h1>

                <p
                  className="hero-fade-in"
                  style={{
                    fontSize: "clamp(1.0625rem, 2vw, 1.25rem)",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.65,
                    maxWidth: "660px",
                    margin: "0 auto 2.25rem",
                  }}
                >
                  {siteConfig.siteName} is the all-in-one AI content platform.
                  Generate SEO-ready articles, manage multi-tenant blogs,
                  schedule publishing, and collaborate with your team — from a
                  single dashboard.
                </p>

                <div
                  className="hero-fade-in"
                  style={{
                    display: "flex",
                    gap: "0.875rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: "2rem",
                  }}
                >
                  <Link href="/register">
                    <button
                      className="btn btn-primary hero-cta-btn"
                      style={{
                        padding: "0.875rem 2rem",
                        fontSize: "1.0625rem",
                        borderRadius: "0.5rem",
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        border: "none",
                        boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                      }}
                    >
                      Start Free — No Credit Card
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                  <Link href="/login">
                    <button
                      className="btn"
                      style={{
                        padding: "0.875rem 2rem",
                        fontSize: "1.0625rem",
                        borderRadius: "0.5rem",
                        fontWeight: 600,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                      }}
                    >
                      Sign In
                    </button>
                  </Link>
                </div>

                {/* Mini trust signals */}
                <div
                  className="hero-fade-in"
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {[
                    "Free plan available",
                    "No setup required",
                    "Cancel anytime",
                  ].map((t) => (
                    <span
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <CheckCircle2 size={14} style={{ color: "#34d399" }} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── mock dashboard visual ── */}
            <div
              className="hero-fade-in container"
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: "1000px",
                marginTop: "3.5rem",
              }}
            >
              <div
                className="hero-dashboard-mock"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* top bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "monospace",
                    }}
                  >
                    {siteConfig.siteName.toLowerCase().replace(/\s+/g, "")}
                    .com/dashboard
                  </span>
                </div>

                {/* stat cards row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Total Articles",
                      val: "1,248",
                      icon: FileText,
                      c: "#818cf8",
                    },
                    {
                      label: "Published",
                      val: "986",
                      icon: CheckCircle2,
                      c: "#34d399",
                    },
                    {
                      label: "Scheduled",
                      val: "64",
                      icon: Clock,
                      c: "#fbbf24",
                    },
                    {
                      label: "AI Generated",
                      val: "712",
                      icon: Sparkles,
                      c: "#f472b6",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "0.625rem",
                        padding: "0.875rem 1rem",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.375rem",
                        }}
                      >
                        <s.icon size={14} style={{ color: s.c }} />
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "rgba(255,255,255,0.45)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                        {s.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* skeleton rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {[85, 70, 55].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: "12px",
                        width: `${w}%`,
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===================== SOCIAL PROOF STATS ===================== */}
          <section
            style={{
              background: "white",
              borderBottom: "1px solid var(--border-color)",
              padding: "3rem 1rem",
            }}
          >
            <div
              className="container"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "2rem",
                textAlign: "center",
                maxWidth: "900px",
              }}
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===================== FEATURES ===================== */}
          <section
            style={{ background: "var(--surface)", padding: "5rem 1rem" }}
          >
            <div className="container" style={{ maxWidth: "1100px" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Features
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    marginBottom: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Everything You Need to Scale Content
                </h2>
                <p
                  style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    fontSize: "1.0625rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  From AI-powered writing to multi-site management,{" "}
                  {siteConfig.siteName}
                  gives you the complete toolkit to produce, schedule, and
                  distribute content at scale.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="feature-card"
                    style={{
                      background: "white",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.75rem",
                      padding: "1.75rem",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "0.625rem",
                        background: `${f.color}14`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <f.icon size={22} style={{ color: f.color }} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.0625rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {f.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== HOW IT WORKS ===================== */}
          <section style={{ background: "white", padding: "5rem 1rem" }}>
            <div className="container" style={{ maxWidth: "900px" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#059669",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  How It Works
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Up and Running in Minutes
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "2rem",
                }}
              >
                {STEPS.map((s) => (
                  <div key={s.num} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.125rem",
                        fontWeight: 800,
                        margin: "0 auto 1.25rem",
                      }}
                    >
                      {s.num}
                    </div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                      }}
                    >
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== USE CASES ===================== */}
          <section
            style={{ background: "var(--surface)", padding: "5rem 1rem" }}
          >
            <div className="container" style={{ maxWidth: "1100px" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#d97706",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Who It&apos;s For
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Built for Creators, Teams & Agencies
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {[
                  {
                    title: "Solo Bloggers & Creators",
                    items: [
                      "Generate draft articles in seconds",
                      "Built-in SEO optimization",
                      "Schedule your editorial calendar",
                      "Free plan to get started",
                    ],
                    gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                    accent: "#7c3aed",
                  },
                  {
                    title: "Marketing Teams",
                    items: [
                      "Collaborate with role-based access",
                      "Track content performance analytics",
                      "Maintain brand voice across writers",
                      "Manage categories and workflows",
                    ],
                    gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                    accent: "#2563eb",
                  },
                  {
                    title: "Agencies & Multi-Site Operators",
                    items: [
                      "Manage unlimited client sites",
                      "Isolated tenant dashboards",
                      "Invite client teams per tenant",
                      "White-label ready platform",
                    ],
                    gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                    accent: "#059669",
                  },
                ].map((uc) => (
                  <div
                    key={uc.title}
                    style={{
                      background: "white",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-color)",
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    className="feature-card"
                  >
                    <div style={{ height: "6px", background: uc.gradient }} />
                    <div style={{ padding: "1.75rem" }}>
                      <h3
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {uc.title}
                      </h3>
                      <ul
                        style={{
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.625rem",
                        }}
                      >
                        {uc.items.map((item) => (
                          <li
                            key={item}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.625rem",
                              fontSize: "0.9rem",
                              color: "var(--text-secondary)",
                              lineHeight: 1.45,
                            }}
                          >
                            <Check
                              size={16}
                              style={{
                                color: uc.accent,
                                marginTop: "0.15rem",
                                flexShrink: 0,
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== TESTIMONIALS ===================== */}
          <section style={{ background: "white", padding: "5rem 1rem" }}>
            <div className="container" style={{ maxWidth: "1100px" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#e11d48",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Testimonials
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Loved by Content Professionals
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.75rem",
                      padding: "1.75rem",
                    }}
                  >
                    {/* stars */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.2rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill="#fbbf24"
                          stroke="#fbbf24"
                        />
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        lineHeight: 1.6,
                        marginBottom: "1.25rem",
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1, #a78bfa)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                        }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== PRICING ===================== */}
          <section
            id="pricing"
            style={{ background: "var(--surface)", padding: "5rem 1rem" }}
          >
            <div className="container" style={{ maxWidth: "1200px" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Pricing
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    marginBottom: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Simple, Transparent Pricing
                </h2>
                <p
                  style={{
                    maxWidth: "560px",
                    margin: "0 auto 1.25rem",
                    fontSize: "1.0625rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  Start <strong>completely free</strong> — no credit card
                  required. Four plans to match every stage of your growth.
                </p>
                <Link
                  href="/pricing"
                  style={{
                    color: "#6366f1",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  View full pricing &amp; feature comparison →
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
                  gap: "1.25rem",
                  alignItems: "stretch",
                }}
              >
                {[
                  {
                    name: "Free",
                    price: "$0",
                    desc: "No commitment, forever",
                    icon: <Shield size={20} style={{ color: "#10b981" }} />,
                    iconBg: "rgba(16,185,129,0.08)",
                    iconBorder: "#6ee7b7",
                    accentColor: "#10b981",
                    dark: false,
                    popular: false,
                    features: [
                      "1 tenant website",
                      "5 articles / month",
                      "Basic AI generation",
                      "1 team member",
                      "Community support",
                    ],
                    cta: "Start Free",
                    ctaHref: "/register",
                  },
                  {
                    name: "Basic",
                    price: "$19",
                    desc: "For individual creators",
                    icon: <Layers size={20} style={{ color: "#2563eb" }} />,
                    iconBg: "#eff6ff",
                    iconBorder: "#93c5fd",
                    accentColor: "#2563eb",
                    dark: false,
                    popular: false,
                    features: [
                      "1 tenant website",
                      "30 articles / month",
                      "Standard AI generation",
                      "2 team members",
                      "SEO tools",
                      "Email support",
                    ],
                    cta: "Start Basic",
                    ctaHref: "/register",
                  },
                  {
                    name: "Pro",
                    price: "$29",
                    desc: "For growing teams",
                    icon: <Zap size={20} style={{ color: "#a78bfa" }} />,
                    iconBg: "rgba(139,92,246,0.18)",
                    iconBorder: "rgba(139,92,246,0.35)",
                    accentColor: "#6366f1",
                    dark: true,
                    popular: true,
                    features: [
                      "5 tenant websites",
                      "200 articles / month",
                      "Advanced AI generation",
                      "Scheduling & analytics",
                      "10 team members",
                      "Social media tools",
                      "Priority support",
                    ],
                    cta: "Start Pro",
                    ctaHref: "/register",
                  },
                  {
                    name: "Enterprise",
                    price: "$79",
                    desc: "For agencies & large teams",
                    icon: <Crown size={20} style={{ color: "#7c3aed" }} />,
                    iconBg: "#faf5ff",
                    iconBorder: "#c4b5fd",
                    accentColor: "#7c3aed",
                    dark: false,
                    popular: false,
                    features: [
                      "Unlimited websites",
                      "Unlimited articles",
                      "All AI models",
                      "Unlimited team members",
                      "API access",
                      "Dedicated manager",
                    ],
                    cta: "Contact Sales",
                    ctaHref: "/contact",
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    style={{
                      background: plan.dark
                        ? "linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)"
                        : "white",
                      border: plan.popular
                        ? "2px solid #6366f1"
                        : "1px solid var(--border-color)",
                      borderRadius: "1rem",
                      padding: "1.75rem",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      boxShadow: plan.popular
                        ? "0 8px 32px rgba(99,102,241,0.22)"
                        : "none",
                    }}
                    className={plan.popular ? "" : "feature-card"}
                  >
                    {plan.popular && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-0.75rem",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.875rem",
                          borderRadius: "999px",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Most Popular
                      </div>
                    )}
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "0.625rem",
                        background: plan.iconBg,
                        border: `1px solid ${plan.iconBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      {plan.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        marginBottom: "0.25rem",
                        color: plan.dark ? "white" : "var(--text-primary)",
                      }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: plan.dark
                          ? "rgba(255,255,255,0.6)"
                          : "var(--text-secondary)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {plan.desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "0.2rem",
                        marginBottom: "1.25rem",
                        paddingBottom: "1.25rem",
                        borderBottom: `1px solid ${plan.dark ? "rgba(255,255,255,0.1)" : "var(--border-color)"}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "2.625rem",
                          fontWeight: 800,
                          lineHeight: 1,
                          color: plan.dark ? "white" : plan.accentColor,
                        }}
                      >
                        {plan.price}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: plan.dark
                            ? "rgba(255,255,255,0.5)"
                            : "var(--text-secondary)",
                          paddingBottom: "0.3rem",
                        }}
                      >
                        /mo
                      </span>
                    </div>
                    <ul
                      style={{
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginBottom: "1.75rem",
                        flex: 1,
                      }}
                    >
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            color: plan.dark
                              ? "rgba(255,255,255,0.78)"
                              : "var(--text-secondary)",
                          }}
                        >
                          <Check
                            size={14}
                            style={{
                              color: plan.dark ? "#a78bfa" : plan.accentColor,
                              marginTop: "0.15rem",
                              flexShrink: 0,
                            }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.ctaHref}>
                      <button
                        style={{
                          width: "100%",
                          padding: "0.6875rem 1rem",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          background: plan.dark
                            ? "white"
                            : plan.popular
                              ? `linear-gradient(135deg, ${plan.accentColor}, #8b5cf6)`
                              : "transparent",
                          color: plan.dark
                            ? "#312e81"
                            : plan.popular
                              ? "white"
                              : plan.accentColor,
                          border:
                            plan.dark || plan.popular
                              ? "none"
                              : `2px solid ${plan.accentColor}`,
                          boxShadow: plan.popular
                            ? `0 4px 14px ${plan.accentColor}40`
                            : "none",
                        }}
                      >
                        {plan.cta} <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <p
                style={{
                  textAlign: "center",
                  marginTop: "2.5rem",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                }}
              >
                All plans include SSL and regular updates.{" "}
                <Link
                  href="/pricing"
                  style={{ color: "#6366f1", fontWeight: 600 }}
                >
                  See full feature comparison →
                </Link>
              </p>
            </div>
          </section>

          {/* ===================== FINAL CTA ===================== */}
          <section
            style={{
              background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)",
              color: "white",
              padding: "5rem 1rem",
              textAlign: "center",
            }}
          >
            <div className="container" style={{ maxWidth: "700px" }}>
              <Sparkles
                size={36}
                style={{ margin: "0 auto 1.25rem", color: "#c4b5fd" }}
              />
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                }}
              >
                Ready to Create Content That Converts?
              </h2>
              <p
                style={{
                  fontSize: "1.0625rem",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                  marginBottom: "2.25rem",
                  maxWidth: "540px",
                  margin: "0 auto 2.25rem",
                }}
              >
                Join thousands of creators and teams using {siteConfig.siteName}{" "}
                to produce, schedule, and grow their content — faster than ever.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.875rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/register">
                  <button
                    className="btn hero-cta-btn"
                    style={{
                      padding: "0.875rem 2.25rem",
                      fontSize: "1.0625rem",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      background: "white",
                      color: "#312e81",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    Get Started Free
                    <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/contact">
                  <button
                    className="btn"
                    style={{
                      padding: "0.875rem 2.25rem",
                      fontSize: "1.0625rem",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    Talk to Us
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

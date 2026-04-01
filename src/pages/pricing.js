import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import siteConfig from "@/lib/siteConfig";
import { PLANS as PLANS_CONFIG, COMPARE } from "@/lib/planConfig";
import {
  Check,
  X,
  Zap,
  Layers,
  Shield,
  Crown,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Users,
  CheckCircle2,
} from "lucide-react";

// Map iconName strings from planConfig to Lucide components
const ICON_MAP = { Shield, Layers, Zap, Crown };

// Enrich config plans with the icon component (keeping config free of React deps)
const PLANS = PLANS_CONFIG.map((p) => ({
  ...p,
  icon: ICON_MAP[p.iconName] || Shield,
  // pricing.js uses `desc` key
  desc: p.description,
}));

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    q: "Is the Free plan really free forever?",
    a: "Yes! The Free plan never expires and requires no credit card. You can use it as long as you like within its limits.",
  },
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Absolutely. You can change your plan at any time from your billing dashboard. Upgrades are prorated and take effect immediately.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards. All payments are processed securely by Paddle, our Merchant of Record.",
  },
  {
    q: "What is your refund policy?",
    a: "We issue refunds if the platform is not functioning as promised due to a system glitch, provided the request is made within 3 days of the initial purchase. The free plan lets you test everything before committing.",
  },
  {
    q: "What happens when I hit my article limit?",
    a: "You'll receive an in-app notification as you approach your limit. You can upgrade instantly or wait for your billing cycle to reset.",
  },
  {
    q: "Can I try Pro features before paying?",
    a: "The Free plan is a great way to evaluate the core platform. For advanced features, you can upgrade at any time and contact us within 3 days if you experience any technical issues.",
  },
];

/* ── cell renderer ── */
function Cell({ value, planColor }) {
  if (value === true)
    return <Check size={18} style={{ color: planColor, margin: "0 auto" }} />;
  if (value === false)
    return (
      <X
        size={16}
        style={{ color: "#d1d5db", margin: "0 auto", opacity: 0.7 }}
      />
    );
  return (
    <span
      style={{
        fontSize: "0.8125rem",
        fontWeight: 500,
        color: "var(--text-primary)",
        display: "block",
        textAlign: "center",
      }}
    >
      {value}
    </span>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const name = siteConfig.siteName;

  return (
    <>
      <Head>
        <title>Pricing — {name}</title>
        <meta
          name="description"
          content={`Simple, transparent pricing for ${name}. Start free and upgrade when you're ready. Free, Basic, Pro, and Enterprise plans available.`}
        />
      </Head>

      <Navbar />

      <main>
        {/* ── HERO ── */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            color: "white",
            padding: "5rem 1rem 4rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blobs */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: "-100px",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              right: "-80px",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="container"
            style={{ position: "relative", zIndex: 2, maxWidth: "700px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "999px",
                padding: "0.375rem 1rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#c4b5fd",
                marginBottom: "1.5rem",
              }}
            >
              <Sparkles size={13} />
              No hidden fees · Cancel anytime
            </div>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1.25rem",
                letterSpacing: "-0.025em",
              }}
            >
              Simple,{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #818cf8, #c084fc, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Transparent
              </span>{" "}
              Pricing
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
                maxWidth: "560px",
                margin: "0 auto 1.75rem",
              }}
            >
              Start free, no credit card required. Upgrade as you grow. Every
              plan includes all the core tools you need to create and publish
              great content.
            </p>

            <div
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
                "Free plan forever",
                "No setup fees",
                "Upgrade or cancel anytime",
              ].map((t) => (
                <span
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <CheckCircle2 size={13} style={{ color: "#34d399" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLAN CARDS ── */}
        <section style={{ background: "var(--surface)", padding: "4rem 1rem" }}>
          <div className="container" style={{ maxWidth: "1200px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))",
                gap: "1.5rem",
                alignItems: "stretch",
              }}
            >
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    style={{
                      background: plan.dark
                        ? "linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)"
                        : "white",
                      border: plan.popular
                        ? "2px solid #6366f1"
                        : `1px solid ${plan.dark ? "rgba(255,255,255,0.08)" : "var(--border-color)"}`,
                      borderRadius: "1rem",
                      padding: "2rem",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      boxShadow: plan.popular
                        ? "0 8px 40px rgba(99,102,241,0.25)"
                        : "none",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    className={plan.popular ? "" : "feature-card"}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-0.8rem",
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
                          letterSpacing: "0.08em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Most Popular
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "0.75rem",
                        background: plan.dark
                          ? "rgba(255,255,255,0.1)"
                          : `${plan.color}18`,
                        border: `1px solid ${
                          plan.dark
                            ? "rgba(255,255,255,0.15)"
                            : plan.color + "40"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={22}
                        style={{
                          color: plan.dark
                            ? "rgba(255,255,255,0.9)"
                            : plan.color,
                        }}
                      />
                    </div>

                    {/* Name */}
                    <h2
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        marginBottom: "0.375rem",
                        color: plan.dark ? "white" : "var(--text-primary)",
                      }}
                    >
                      {plan.name}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: plan.dark
                          ? "rgba(255,255,255,0.6)"
                          : "var(--text-secondary)",
                        marginBottom: "1.5rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {plan.desc}
                    </p>

                    {/* Price */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "0.25rem",
                        marginBottom: "1.75rem",
                        paddingBottom: "1.5rem",
                        borderBottom: `1px solid ${
                          plan.dark
                            ? "rgba(255,255,255,0.1)"
                            : "var(--border-color)"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "3rem",
                          fontWeight: 800,
                          lineHeight: 1,
                          color: plan.dark ? "white" : plan.color,
                        }}
                      >
                        ${plan.price}
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: plan.dark
                            ? "rgba(255,255,255,0.5)"
                            : "var(--text-secondary)",
                          paddingBottom: "0.375rem",
                        }}
                      >
                        / month
                      </span>
                    </div>

                    {/* Features */}
                    <ul
                      style={{
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.625rem",
                        marginBottom: "2rem",
                        flex: 1,
                      }}
                    >
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.625rem",
                            fontSize: "0.875rem",
                            color: plan.dark
                              ? "rgba(255,255,255,0.78)"
                              : "var(--text-secondary)",
                            lineHeight: 1.45,
                          }}
                        >
                          <Check
                            size={15}
                            style={{
                              color: plan.dark ? "#a78bfa" : plan.color,
                              marginTop: "0.125rem",
                              flexShrink: 0,
                            }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href={plan.ctaHref}>
                      <button
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "0.625rem",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          transition: "all 0.15s",
                          background: plan.dark
                            ? "white"
                            : plan.popular
                              ? `linear-gradient(135deg, ${plan.color}, #8b5cf6)`
                              : "transparent",
                          color: plan.dark
                            ? "#312e81"
                            : plan.popular
                              ? "white"
                              : plan.color,
                          border: plan.dark
                            ? "none"
                            : plan.popular
                              ? "none"
                              : `2px solid ${plan.color}`,
                          boxShadow: plan.popular
                            ? `0 4px 16px ${plan.color}40`
                            : "none",
                        }}
                      >
                        {plan.cta}
                        <ArrowRight size={16} />
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON ── */}
        <section style={{ background: "white", padding: "4rem 1rem" }}>
          <div className="container" style={{ maxWidth: "1100px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
                Compare Plans
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Everything You Get, Side by Side
              </h2>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                {/* Header */}
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "1rem 1.25rem",
                        borderBottom: "2px solid var(--border-color)",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        fontSize: "0.8125rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 200,
                      }}
                    >
                      Feature
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.id}
                        style={{
                          padding: "1rem 1.25rem",
                          borderBottom: "2px solid var(--border-color)",
                          textAlign: "center",
                          fontWeight: 800,
                          fontSize: "0.9375rem",
                          color: p.dark ? "#312e81" : p.color,
                          position: "relative",
                        }}
                      >
                        {p.name}
                        {p.popular && (
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: "0.5rem",
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              color: "white",
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              padding: "0.1rem 0.5rem",
                              borderRadius: "999px",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              verticalAlign: "middle",
                            }}
                          >
                            Popular
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr
                      key={row.label}
                      style={{
                        background: i % 2 === 0 ? "white" : "#f8fafc",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.875rem 1.25rem",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        {row.label}
                      </td>
                      {PLANS.map((p) => (
                        <td
                          key={p.id}
                          style={{
                            padding: "0.875rem 1.25rem",
                            textAlign: "center",
                            borderBottom: "1px solid var(--border-color)",
                            background:
                              p.popular && i % 2 === 0
                                ? "#f5f3ff"
                                : p.popular
                                  ? "#ede9fe"
                                  : undefined,
                          }}
                        >
                          <Cell value={row[p.id]} planColor={p.color} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Price row */}
                  <tr style={{ background: "#f8fafc" }}>
                    <td
                      style={{
                        padding: "1.25rem 1.25rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        borderTop: "2px solid var(--border-color)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      Price/month
                    </td>
                    {PLANS.map((p) => (
                      <td
                        key={p.id}
                        style={{
                          padding: "1.25rem 1.25rem",
                          textAlign: "center",
                          borderTop: "2px solid var(--border-color)",
                          borderBottom: "1px solid var(--border-color)",
                          fontWeight: 800,
                          fontSize: "1.25rem",
                          color: p.dark ? "#312e81" : p.color,
                          background: p.popular ? "#ede9fe" : undefined,
                        }}
                      >
                        ${p.price}
                      </td>
                    ))}
                  </tr>

                  {/* CTA row */}
                  <tr>
                    <td style={{ padding: "1.25rem 1.25rem" }} />
                    {PLANS.map((p) => (
                      <td
                        key={p.id}
                        style={{
                          padding: "1.25rem 1.25rem",
                          textAlign: "center",
                          background: p.popular ? "#ede9fe" : undefined,
                        }}
                      >
                        <Link href={p.ctaHref}>
                          <button
                            style={{
                              padding: "0.5rem 1.25rem",
                              borderRadius: "0.5rem",
                              fontWeight: 600,
                              fontSize: "0.8125rem",
                              cursor: "pointer",
                              background: p.popular
                                ? `linear-gradient(135deg, ${p.color}, #8b5cf6)`
                                : "transparent",
                              color: p.popular ? "white" : p.color,
                              border: p.popular
                                ? "none"
                                : `2px solid ${p.color}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.cta}
                          </button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: "var(--surface)", padding: "4rem 1rem" }}>
          <div className="container" style={{ maxWidth: "720px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
                FAQ
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      border: `1px solid ${isOpen ? "#6366f1" : "var(--border-color)"}`,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "1.125rem 1.375rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: isOpen ? "#6366f1" : "var(--text-primary)",
                          transition: "color 0.2s",
                        }}
                      >
                        {item.q}
                      </span>
                      <ChevronDown
                        size={18}
                        style={{
                          color: isOpen ? "#6366f1" : "var(--text-secondary)",
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s, color 0.2s",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 1.375rem 1.125rem",
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          lineHeight: 1.65,
                          borderTop: "1px solid var(--border-color)",
                          paddingTop: "1rem",
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)",
            color: "white",
            padding: "5rem 1rem",
            textAlign: "center",
          }}
        >
          <div className="container" style={{ maxWidth: "640px" }}>
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
              Start Free Today
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                marginBottom: "2.25rem",
              }}
            >
              No credit card required. Get started with the Free plan and
              upgrade whenever you&apos;re ready.
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
                  style={{
                    padding: "0.875rem 2.25rem",
                    fontSize: "1.0625rem",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    background: "white",
                    color: "#312e81",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/contact">
                <button
                  style={{
                    padding: "0.875rem 2.25rem",
                    fontSize: "1.0625rem",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Talk to Sales
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

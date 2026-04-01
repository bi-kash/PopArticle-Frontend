/**
 * Single source of truth for subscription plan definitions.
 *
 * Update this file to change prices, limits, features, or any plan detail.
 * pricing.js, dashboard/subscription.js, and index.js all import from here
 * so every page stays in sync automatically.
 */

// ── Core limits (used for enforcement checks & display) ─────────────────────
export const PLAN_LIMITS = {
  free: {
    articleLimit: 10,
    aiCreditLimit: 10,
    allowedModels: ["gpt-4o-mini"],
    hasApiAccess: false,
    hasInvitationAccess: false,
  },
  basic: {
    articleLimit: 100,
    aiCreditLimit: 50,
    allowedModels: ["gpt-4o-mini", "gpt-4o"],
    hasApiAccess: false,
    hasInvitationAccess: true,
  },
  pro: {
    articleLimit: 500,
    aiCreditLimit: 200,
    allowedModels: ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview"],
    hasApiAccess: true,
    hasInvitationAccess: true,
  },
  enterprise: {
    articleLimit: 1500,
    aiCreditLimit: 1000,
    allowedModels: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4.5-preview",
      "o1",
      "o3-mini",
    ],
    hasApiAccess: true,
    hasInvitationAccess: true,
  },
};

// ── Full plan definitions (price, display, features) ────────────────────────
// iconName maps to icons in consuming components (Lucide: Shield, Layers, Zap, Crown)
export const PLANS = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    price: 0,
    description: "Explore the platform with no commitment",
    iconName: "Shield",
    color: "#10b981",
    accentBg: "#ecfdf5",
    accentBorder: "#6ee7b7",
    dark: false,
    popular: false,
    cta: "Get Started Free",
    ctaHref: "/register",
    features: [
      "10 articles / month",
      "10 AI credits / month",
      "GPT-4o Mini model",
      "Unlimited tenants",
      "Community support",
    ],
    ...PLAN_LIMITS.free,
  },
  {
    id: "basic",
    name: "basic",
    displayName: "Basic",
    price: 20,
    description: "For individual creators getting serious",
    iconName: "Layers",
    color: "#2563eb",
    accentBg: "#eff6ff",
    accentBorder: "#93c5fd",
    dark: false,
    popular: false,
    cta: "Start Basic",
    ctaHref: "/register",
    features: [
      "100 articles / month",
      "50 AI credits / month",
      "GPT-4o Mini + GPT-4o models",
      "Team member invitations",
      "SEO metadata & slugs",
      "Email support",
    ],
    ...PLAN_LIMITS.basic,
  },
  {
    id: "pro",
    name: "pro",
    displayName: "Pro",
    price: 50,
    description: "For growing teams and power users",
    iconName: "Zap",
    color: "#6366f1",
    accentBg: "rgba(99,102,241,0.08)",
    accentBorder: "rgba(99,102,241,0.35)",
    dark: true,
    popular: true,
    cta: "Start Pro",
    ctaHref: "/register",
    features: [
      "500 articles / month",
      "200 AI credits / month",
      "GPT-4o Mini, GPT-4o & GPT-4.5 Preview",
      "Team member invitations",
      "API access",
      "Smart content scheduling",
      "Analytics & insights",
      "Social media distribution",
      "Priority support",
    ],
    ...PLAN_LIMITS.pro,
  },
  {
    id: "enterprise",
    name: "enterprise",
    displayName: "Enterprise",
    price: 100,
    description: "For agencies and large-scale operations",
    iconName: "Crown",
    color: "#7c3aed",
    accentBg: "#faf5ff",
    accentBorder: "#c4b5fd",
    dark: false,
    popular: false,
    cta: "Start Enterprise",
    ctaHref: "/register",
    features: [
      "1,500 articles / month",
      "1,000 AI credits / month",
      "All AI models (incl. o1, o3-mini)",
      "Team member invitations",
      "API access",
      "Scheduling & automation",
      "Advanced analytics & custom reports",
      "Social media distribution",
      "Dedicated account manager",
    ],
    ...PLAN_LIMITS.enterprise,
  },
];

// ── Feature comparison table (used on pricing page) ──────────────────────────
export const COMPARE = [
  {
    label: "Articles / month",
    free: "10",
    basic: "100",
    pro: "500",
    enterprise: "1,500",
  },
  {
    label: "AI credits / month",
    free: "10",
    basic: "50",
    pro: "200",
    enterprise: "1,000",
  },
  {
    label: "AI models",
    free: "GPT-4o Mini",
    basic: "+GPT-4o",
    pro: "+GPT-4.5 Preview",
    enterprise: "+o1, o3-mini",
  },
  {
    label: "Team invitations",
    free: false,
    basic: true,
    pro: true,
    enterprise: true,
  },
  {
    label: "API access",
    free: false,
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    label: "Content scheduling",
    free: false,
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    label: "Analytics & insights",
    free: false,
    basic: "Basic",
    pro: "Advanced",
    enterprise: "Custom",
  },
  {
    label: "Social media tools",
    free: false,
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    label: "SEO tools & slugs",
    free: false,
    basic: true,
    pro: true,
    enterprise: true,
  },
  {
    label: "Priority support",
    free: false,
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    label: "Dedicated manager",
    free: false,
    basic: false,
    pro: false,
    enterprise: true,
  },
];

// ── Helper: look up a plan by name (case-insensitive) ───────────────────────
export function getPlanConfig(planName) {
  return PLANS.find((p) => p.name === planName?.toLowerCase()) || PLANS[0];
}

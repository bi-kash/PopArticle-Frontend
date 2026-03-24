import Link from "next/link";
import config from "@/contents/site-settings.json";

export default function Logo({ variant = "light", size = "default" }) {
  const logoText = config.logo_text || config.site_title || "Site Logo";

  const words = logoText.split(" ").filter(Boolean);
  const topWord = words[0] || logoText;
  const bottomWord = words[1] || "";
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const palette =
    Array.isArray(config.logo_colors) && config.logo_colors.length > 0
      ? config.logo_colors
      : ["#6366f1", "#8b5cf6"];

  const isLight = variant === "light";
  const isSmall = size === "small";
  const iconSize = isSmall ? 28 : 34;
  const fontSize = isSmall ? "1rem" : "1.2rem";

  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: isSmall ? "0.5rem" : "0.625rem",
        textDecoration: "none",
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Icon mark */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize * 0.25,
          background: isLight
            ? "rgba(255,255,255,0.15)"
            : `linear-gradient(135deg, ${palette[0]}, ${palette[1] || palette[0]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isLight ? "white" : "white",
          fontWeight: 800,
          fontSize: iconSize * 0.4,
          letterSpacing: "-0.02em",
          flexShrink: 0,
          border: isLight ? "1.5px solid rgba(255,255,255,0.3)" : "none",
        }}
      >
        {initials}
      </div>

      {/* Text */}
      <div
        style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize,
            color: isLight ? "white" : palette[0],
            letterSpacing: "-0.02em",
          }}
        >
          {topWord}
        </span>
        {bottomWord && (
          <span
            style={{
              fontWeight: 800,
              fontSize,
              color: isLight
                ? "rgba(255,255,255,0.85)"
                : palette[1] || palette[0],
              letterSpacing: "-0.01em",
              marginTop: "-1px",
            }}
          >
            {bottomWord}
          </span>
        )}
      </div>
    </Link>
  );
}

import Link from "next/link";
import config from "@/contents/site-settings.json";

export default function Logo({ variant = "light", size = "default" }) {
  const logoText = config.logo_text || config.site_title || "Site Logo";

  const words = logoText.split(" ").filter(Boolean);
  const topWord = words[0] || logoText;
  const bottomWord = words[1] || "";

  const palette =
    Array.isArray(config.logo_colors) && config.logo_colors.length > 0
      ? config.logo_colors
      : ["#6366f1", "#8b5cf6", "#a78bfa", "#0f172a", "#64748b"];
  const getColor = (index) => palette[index % palette.length];

  const isLight = variant === "light";
  const fontSize = size === "small" ? "1.125rem" : "1.375rem";

  return (
    <Link
      href="/"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        fontSize,
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
      }}
    >
      <span
        style={{
          display: "block",
          fontWeight: 600,
          fontStyle: "italic",
          color: isLight ? "white" : getColor(0),
        }}
      >
        {topWord}
      </span>
      {bottomWord && (
        <span
          style={{
            display: "block",
            marginTop: "-2px",
            fontWeight: 800,
            fontStyle: "normal",
            color: isLight ? "rgba(255,255,255,0.9)" : getColor(1),
          }}
        >
          {bottomWord}
        </span>
      )}
    </Link>
  );
}

import { useEffect } from "react";
import "@/styles/globals.css";
import "react-quill/dist/quill.snow.css";
import "easymde/dist/easymde.min.css";
import Head from "next/head";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "PopArticle";
const DEFAULT_DESCRIPTION =
  "AI-powered content generation and management platform.";

// Prefer an absolute site URL for Open Graph images so crawlers can fetch them.
// Set NEXT_PUBLIC_SITE_URL (e.g. https://example.com). If not set and running
// in the browser, fall back to `window.location.origin`. Final fallback is
// the relative path which may not be valid for some crawlers.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
const DEFAULT_OG_IMAGE = SITE_URL
  ? `${SITE_URL.replace(/\/$/, "")}/og-default.svg`
  : "/og-default.svg";

// Paddle client-side token for checkout
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PADDLE_ENVIRONMENT =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox";

export default function App({ Component, pageProps }) {
  // Initialize Paddle.js for payments
  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN) {
      console.warn(
        "⚠️ NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set. Paddle checkout will not work.",
      );
      return;
    }

    // Check if Paddle is already loaded
    if (window.Paddle) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Paddle) {
        // Set environment (sandbox for testing, production for live)
        if (PADDLE_ENVIRONMENT === "sandbox") {
          window.Paddle.Environment.set("sandbox");
        }

        window.Paddle.Initialize({
          token: PADDLE_CLIENT_TOKEN,
        });
        console.log("✅ Paddle initialized successfully");
      }
    };

    script.onerror = () => {
      console.error("❌ Failed to load Paddle.js script");
    };

    return () => {
      // Cleanup script on unmount (though this rarely happens for _app)
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />

        {/* Open Graph / Facebook */}
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={APP_NAME} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

import { useEffect } from "react";
import "@/styles/globals.css";
import "react-quill/dist/quill.snow.css";
import "easymde/dist/easymde.min.css";
import Head from "next/head";
import siteConfig from "@/lib/siteConfig";

const APP_NAME = siteConfig.siteName;
const DEFAULT_DESCRIPTION = siteConfig.description;

// Prefer an absolute site URL for Open Graph images so crawlers can fetch them.
// Set NEXT_PUBLIC_SITE_URL (e.g. https://example.com). If not set and running
// in the browser, fall back to `window.location.origin`. Final fallback is
// the relative path which may not be valid for some crawlers.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
const DEFAULT_OG_IMAGE = SITE_URL
  ? `${SITE_URL.replace(/\/$/, "")}/og-default.png`
  : "/og-default.png";

// Paddle environment (safe to expose)
const PADDLE_ENVIRONMENT =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox";

export default function App({ Component, pageProps }) {
  // Initialize Paddle.js for payments
  useEffect(() => {
    // Check if Paddle is already loaded
    if (window.Paddle) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      if (!window.Paddle) return;

      // Set environment (sandbox for testing, production for live)
      if (PADDLE_ENVIRONMENT === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      // Fetch the client token from a secure server-side route so it is not
      // embedded at build time in the client bundle. You can add auth checks
      // to the API route if you want the server to gate access.
      try {
        const resp = await fetch("/api/paddle-token");
        if (!resp.ok) {
          console.warn("Failed to fetch Paddle client token from server");
          return;
        }

        const data = await resp.json();
        const token = data.token;
        if (!token) {
          console.warn("No Paddle token returned from server");
          return;
        }

        window.Paddle.Initialize({
          token,
        });
        console.log(
          "✅ Paddle initialized successfully (token fetched from server)",
        );
      } catch (err) {
        console.error("Error fetching Paddle token:", err);
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

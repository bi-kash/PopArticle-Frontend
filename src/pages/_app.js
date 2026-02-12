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

export default function App({ Component, pageProps }) {
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

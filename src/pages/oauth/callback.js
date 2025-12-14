import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        // Check if we're on the backend callback page showing JSON
        const bodyText = document.body.innerText || document.body.textContent;

        // Try to parse if the page is displaying JSON
        let data = null;
        try {
          data = JSON.parse(bodyText);
        } catch (e) {
          // Not JSON in body, try query params
        }

        // If we got JSON response from backend
        if (data && data.access_token) {
          const tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          };
          if (data.user) {
            tokenData.user = data.user;
          }

          authService.setTokens(tokenData);

          // Get redirect from session storage or default to dashboard
          const redirect =
            sessionStorage.getItem("oauth_redirect") || "/dashboard";
          sessionStorage.removeItem("oauth_redirect");

          // Redirect to dashboard
          router.replace(redirect);
          return;
        }

        // Try URL query params
        const qp = new URLSearchParams(window.location.search);
        const access_token = qp.get("access_token") || qp.get("token");
        const refresh_token = qp.get("refresh_token");
        let user = null;

        if (qp.get("user")) {
          try {
            user = JSON.parse(decodeURIComponent(qp.get("user")));
          } catch (e) {
            console.error("Failed to parse user data", e);
          }
        }

        if (access_token) {
          const tokenData = { access_token };
          if (refresh_token) tokenData.refresh_token = refresh_token;
          if (user) tokenData.user = user;

          authService.setTokens(tokenData);

          const redirect =
            sessionStorage.getItem("oauth_redirect") || "/dashboard";
          sessionStorage.removeItem("oauth_redirect");

          router.replace(redirect);
          return;
        }

        // Check for errors
        const err = qp.get("error") || qp.get("error_description");
        if (err) {
          setError(err);
          setTimeout(() => router.replace("/login"), 3000);
          return;
        }

        // If we're still on backend URL, redirect to frontend
        if (
          window.location.href.includes("localhost:5000") ||
          window.location.href.includes(process.env.NEXT_PUBLIC_API_BASE_URL)
        ) {
          // We're on the backend, need to handle this differently
          // This shouldn't happen with proper backend redirect
          setError(
            "OAuth callback received. Please configure backend to redirect to frontend."
          );
          setTimeout(() => router.replace("/login"), 3000);
          return;
        }

        // No tokens found
        setError("No authentication data received");
        setTimeout(() => router.replace("/login"), 3000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Failed to process OAuth response");
        setTimeout(() => router.replace("/login"), 3000);
      }
    };

    // Wait a bit for page to load fully
    setTimeout(handleOAuthResponse, 100);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
      }}
    >
      <div className="card" style={{ textAlign: "center", maxWidth: "400px" }}>
        {error ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h3
              style={{ marginBottom: "0.5rem", color: "var(--danger-color)" }}
            >
              OAuth Error
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              {error}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
            <h3 style={{ marginBottom: "0.5rem" }}>Signing you in...</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Please wait while we complete your authentication
            </p>
            <div className="loading">
              <div className="spinner"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

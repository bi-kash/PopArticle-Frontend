import { useEffect } from "react";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";

// AdminRoute only guards authentication.
// Authorization is enforced by the backend — if the user lacks admin privileges
// the API returns 403, and each page handles that redirect individually.
export default function AdminRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  if (!authService.isAuthenticated()) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return children;
}

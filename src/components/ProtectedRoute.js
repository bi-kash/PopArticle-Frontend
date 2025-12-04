import { useEffect } from "react";
import { useRouter } from "next/router";
import { authService } from "@/lib/authService";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
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

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { tenantService } from "./tenantService";

// Hook to resolve the route param (which may be a slug or ID) to a tenant
export function useTenantBySlug(paramName = "id") {
  const router = useRouter();
  const param = router.query[paramName];
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!param) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    // Detect if param is a numeric ID or UUID (both are backend IDs, not slugs)
    const isNumeric = /^\d+$/.test(param);
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        param,
      );

    const resolve = isNumeric
      ? tenantService.getTenant(param).then((d) => d.tenant || d)
      : isUUID
        ? tenantService.getTenantBySlug(param) // will match by .id for UUIDs
        : tenantService.getTenantBySlug(param);

    resolve
      .then((t) => {
        if (!cancelled) {
          setTenant(t);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message || err.message || "Tenant not found",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [param]);

  const slug = param; // The URL-visible identifier
  const tenantId = tenant?.id;

  return { tenant, tenantId, slug, loading, error };
}

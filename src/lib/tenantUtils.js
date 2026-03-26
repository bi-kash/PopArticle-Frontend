export function getTenantSlug(tenant) {
  return (
    tenant.slug ||
    tenant.name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") ||
    String(tenant.id)
  );
}

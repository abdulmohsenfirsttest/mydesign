// Staff roles + per-account permissions for the admin side (Meeting-3 workflow).
// Enforcement is client-side today (localStorage session), matching the existing
// admin auth (ADR-0001). True server-side/RLS enforcement is Security Phase 2.

export type Role = "manager" | "designer" | "project_manager";

export const ROLES: { value: Role; label: string }[] = [
  { value: "manager", label: "Manager / Owner" },
  { value: "designer", label: "Designer" },
  { value: "project_manager", label: "Project Manager" },
];

export function roleLabel(role?: string | null): string {
  return ROLES.find((r) => r.value === role)?.label ?? "Manager / Owner";
}

// The admin sections an account can be granted access to. "overview" (/admin) is
// always visible; everything else is toggleable per account by the owner.
export type Area = "projects" | "hub" | "pricing" | "clients" | "bookings" | "quotes" | "uploads" | "staff";

export const AREAS: { key: Area; label: string; href: string }[] = [
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "hub", label: "Project Hub", href: "/admin/messages" },
  { key: "pricing", label: "Pricing", href: "/admin/pricing" },
  { key: "clients", label: "Clients", href: "/admin/clients" },
  { key: "bookings", label: "Bookings", href: "/admin/bookings" },
  { key: "quotes", label: "Quotes", href: "/admin/quotes" },
  { key: "uploads", label: "Upload Files", href: "/admin/uploads" },
  { key: "staff", label: "Staff & Permissions", href: "/admin/staff" },
];

// What each role can see by default, used when an account has no explicit
// permissions set (permissions === null).
export function roleDefaultAreas(role: Role): Area[] {
  if (role === "manager") return AREAS.map((a) => a.key);
  if (role === "project_manager") return ["projects", "hub", "clients", "bookings"];
  return ["projects", "hub", "uploads"]; // designer
}

export type AdminSession = { id: string; name: string; role: Role; permissions: Area[] | null };

// Read the signed-in admin from localStorage (client-only).
export function getAdmin(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem("admin_id");
  if (!id) return null;
  const role = (localStorage.getItem("admin_role") as Role) || "manager";
  let permissions: Area[] | null = null;
  try {
    const p = localStorage.getItem("admin_permissions");
    const parsed = p ? JSON.parse(p) : null;
    permissions = Array.isArray(parsed) ? (parsed as Area[]) : null;
  } catch {
    permissions = null;
  }
  return { id, name: localStorage.getItem("admin_name") ?? "", role, permissions };
}

// The effective set of areas an account can see: their explicit permissions if
// set, otherwise the role defaults.
export function effectiveAreas(a: { role: Role; permissions: Area[] | null } | null): Area[] {
  if (!a) return [];
  return a.permissions ?? roleDefaultAreas(a.role);
}

// Can the signed-in admin see a given area? (Overview is always allowed.)
export function canSee(a: { role: Role; permissions: Area[] | null } | null, area: Area): boolean {
  return effectiveAreas(a).includes(area);
}

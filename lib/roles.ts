// Staff roles for the admin side (Meeting-3 workflow).
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

export type AdminSession = { id: string; name: string; role: Role };

// Read the signed-in admin from localStorage (client-only).
export function getAdmin(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem("admin_id");
  if (!id) return null;
  const role = (localStorage.getItem("admin_role") as Role) || "manager";
  return { id, name: localStorage.getItem("admin_name") ?? "", role };
}

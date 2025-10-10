// src/lib/auth-utils.ts
import type { RRole, RPermission } from "@/types/auth";

/** Extrae nombres de roles y permisos (roles + directos), sin duplicados */
export function extractAuthNames(input: {
  roles?: Array<string | RRole>;
  permissions?: Array<string | RPermission>;
}) {
  const roleNames = new Set<string>();
  const permNames = new Set<string>();

  // roles
  (input.roles ?? []).forEach((r: any) => {
    const name = typeof r === "string" ? r : r?.name;
    if (name) roleNames.add(name);

    // permisos dentro de cada rol
    const rp = (typeof r === "object" ? (r?.permissions ?? []) : []) as any[];
    rp.forEach((p) => {
      const pname = typeof p === "string" ? p : p?.name;
      if (pname) permNames.add(pname);
    });
  });

  // permisos directos
  (input.permissions ?? []).forEach((p: any) => {
    const name = typeof p === "string" ? p : p?.name;
    if (name) permNames.add(name);
  });

  return {
    roles: Array.from(roleNames),
    permissions: Array.from(permNames),
  };
}

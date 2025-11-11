// src/hooks/useAuthZ.ts
import { useAuth } from "@/hooks/useAuth";
import { extractAuthNames } from "@/lib/auth-utils";
import { makeCan } from "@/lib/authz";

export function useAuthZ() {
  const { roles: rolesRaw = [], permissions: permsRaw = [] } = useAuth();

  const { roles, permissions } = extractAuthNames({
    roles: rolesRaw,
    permissions: permsRaw,
  });

  const { can } = makeCan(permissions, roles);

  return { can, roles, permissions };
}

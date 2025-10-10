// src/lib/authz.ts
export type CanOptions = {
  anyOf?: string[];     // permisos (basta uno)
  allOf?: string[];     // permisos (todos)
  rolesAnyOf?: string[]; // roles (basta uno)
  rolesAllOf?: string[]; // roles (todos)
};

export function makeCan(permissions: string[] = [], roles: string[] = []) {
  const pset = new Set(permissions);
  const rset = new Set(roles);

  const hasAll = (arr?: string[]) => !arr?.length || arr.every((x) => pset.has(x));
  const hasAny = (arr?: string[]) => !arr?.length || arr.some((x) => pset.has(x));
  const roleAll = (arr?: string[]) => !arr?.length || arr.every((x) => rset.has(x));
  const roleAny = (arr?: string[]) => !arr?.length || arr.some((x) => rset.has(x));

  const can = (opts?: CanOptions) => {
    if (!opts) return true;
    return (
      hasAll(opts.allOf) &&
      hasAny(opts.anyOf) &&
      roleAll(opts.rolesAllOf) &&
      roleAny(opts.rolesAnyOf)
    );
  };

  return { can };
}

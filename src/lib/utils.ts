import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function toRepoSlug(nombre: string): "dataverse" | "dspace" | "geonetwork" | null {
  const n = nombre.trim().toLowerCase();
  const map: Record<string, "dataverse" | "dspace" | "geonetwork"> = {
    dataverse: "dataverse",
    dspace: "dspace",
    geonetwork: "geonetwork",
    "geo-network": "geonetwork",
  };
  if (map[n]) return map[n];
  const slug = n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return map[slug] ?? null;
}
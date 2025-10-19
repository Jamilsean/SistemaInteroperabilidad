// src/services/autocompleteService.ts
import { api } from "@/lib/api";
import type {
  AutocompleteItem,
  AutocompleteQuery,
  AutocompleteResponse,
} from "@/types/autocomplete";

export async function fetchAutocomplete(
  params: AutocompleteQuery,
  signal?: AbortSignal
): Promise<AutocompleteItem[]> {
  const res = await api.get<AutocompleteResponse>("/autocomplete", {
    params,
    signal, // para poder cancelar en vuelo
  });
  return res.data;
}

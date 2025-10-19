// src/hooks/useAutocomplete.ts
import * as React from "react";
import { fetchAutocomplete } from "@/services/autocompleteService";
import type { AutocompleteItem } from "@/types/autocomplete";

export function useAutocomplete(query: string, limit = 8) {
  const [items, setItems] = React.useState<AutocompleteItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAutocomplete(
          { q: query.trim(), limit },
          ctrl.signal
        );
        setItems(data);
        setOpen(data.length > 0);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          setError("No se pudo obtener sugerencias");
        }
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce 250 ms

    return () => {
      clearTimeout(timeout);
      ctrl.abort(); // cancelar petición en vuelo
    };
  }, [query, limit]);

  return { items, open, setOpen, loading, error };
}

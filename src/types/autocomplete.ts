// src/types/autocomplete.ts
export interface AutocompleteItem {
  id: number;
  /** HTML con etiquetas <mark> desde el backend */
  title: string;
}

export type AutocompleteResponse = AutocompleteItem[];

export interface AutocompleteQuery {
  q: string;      // >= 2 y <= 100
  limit?: number; // 1..20
}

/** Permite SOLO <mark> y elimina cualquier otra etiqueta HTML. */
export function allowOnlyMark(html: string): string {
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, "");
}

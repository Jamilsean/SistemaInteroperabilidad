export interface AutocompleteItem {
  id: number;
  title: string;
}

export type AutocompleteResponse = AutocompleteItem[];

export interface AutocompleteQuery {
  q: string;    
  limit?: number; 
}

// PARA ETIQUETA <mark> y elimina cualquier otra etiqueta HTML
export function allowOnlyMark(html: string): string {
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, "");
}

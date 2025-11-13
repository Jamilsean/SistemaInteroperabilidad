"use client";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { allowOnlyMark } from "@/types/autocomplete";

const REPO_DATASET = 1;
const REPO_DOCUMENTO = 2;
const REPO_MAPA = 3;
const DOC_ROUTE_BASE = "/recursos";

// === helpers de fecha (acepta YYYY | YYYY-MM | YYYY-MM-DD) ===
const RE_YEAR = /^\d{4}$/;
const RE_YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const RE_FULL = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isValidDateExpr(v: string): boolean {
  return RE_YEAR.test(v) || RE_YEAR_MONTH.test(v) || RE_FULL.test(v);
}

/** Convierte una expresión de fecha a una comparable YYYY-MM-DD
 *  - bound="min": completa con "-01-01" ó "-01"
 *  - bound="max": completa con "-12-31" ó último día aproximado ("-12-31" para YYYY, "-31" para YYYY-MM)
 *  No necesitamos exactitud de último día del mes para comparar rangos inclusive.
 */
function normalizeForCompare(v: string, bound: "min" | "max"): string {
  if (RE_FULL.test(v)) return v;
  if (RE_YEAR_MONTH.test(v)) return bound === "min" ? `${v}-01` : `${v}-31`;
  if (RE_YEAR.test(v)) return bound === "min" ? `${v}-01-01` : `${v}-12-31`;
  return v; // dejar tal cual si no matchea (igual fallará la validación)
}

export default function HeroSearchMeili() {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // filtros básicos
  const [search, setSearch] = React.useState("");
  const [searchIn, setSearchIn] = React.useState<"title" | "autores" | "abstract" | "key_words">("title");
  const [sortBy, setSortBy] = React.useState<"title" | "autores" | "abstract" | "key_words" | "views">("title");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [repo, setRepo] = React.useState<"all" | "dataset" | "documento" | "mapa">("all");

  // fechas
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");
  const [dateError, setDateError] = React.useState<string>("");

  // autocomplete
  const { items: suggestions, open, setOpen, loading } = useAutocomplete(search, 8);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const validateDates = (): boolean => {
    setDateError("");

    // si no hay fechas, nada que validar
    const hasFrom = dateFrom.trim().length > 0;
    const hasTo = dateTo.trim().length > 0;
    if (!hasFrom && !hasTo) return true;

    // formato
    if (hasFrom && !isValidDateExpr(dateFrom.trim())) {
      setDateError("La fecha 'Desde' debe ser YYYY, YYYY-MM o YYYY-MM-DD.");
      return false;
    }
    if (hasTo && !isValidDateExpr(dateTo.trim())) {
      setDateError("La fecha 'Hasta' debe ser YYYY, YYYY-MM o YYYY-MM-DD.");
      return false;
    }

    // rango
    if (hasFrom && hasTo) {
      const a = normalizeForCompare(dateFrom.trim(), "min");
      const b = normalizeForCompare(dateTo.trim(), "max");
      if (a > b) {
        setDateError("La fecha 'Desde' no puede ser mayor que 'Hasta'.");
        return false;
      }
    }

    return true;
  };

  const submit = () => {
    if (!validateDates()) return;

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    params.set("search_in", searchIn);
    params.set("sort_by", sortBy);
    params.set("sort_dir", sortDir);

    if (repo !== "all") {
      const id = repo === "dataset" ? REPO_DATASET : repo === "documento" ? REPO_DOCUMENTO : REPO_MAPA;
      params.set("repositorio_id", String(id));
    }

    if (dateFrom.trim()) params.set("date_issued_from", dateFrom.trim());
    if (dateTo.trim()) params.set("date_issued_to", dateTo.trim());

    navigate(`/buscar?${params.toString()}`);
    setOpen(false);
    setActiveIndex(-1);
  };

  const goToSuggestion = (id: number) => {
    navigate(`${DOC_ROUTE_BASE}/${id}`);
    setOpen(false);
    setActiveIndex(-1);
  };

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!listRef.current || !inputRef.current) return;
      const target = e.target as Node;
      if (!listRef.current.contains(target) && !inputRef.current.contains(target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [setOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") submit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        goToSuggestion(suggestions[activeIndex].id);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };
  // const RE_YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
  // function isValidYearMonth(v: string) {
  //   return RE_YEAR_MONTH.test(v);
  // }

  // function isFromLTETo(from?: string, to?: string) {
  //   if (!from || !to) return true;
  //   return from <= to;
  // }
  return (
    <section className="relative ">
      <div className="relative z-10 p-0 sm:py-5 lg:py-10 ">
        <div className="container mx-auto w-full s:w-2/3 px-0 sm:px-4 lg:px-8">
          <Card className="p-2 lg:p-6 gap-3 sm:gap-6 rounded-2xl backdrop-blur bg-white/5">
            <div className="flex flex-col sm:flex-row gap-3 sm:mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar por título, autor, tema…"
                  className="pl-10 h-10 text-base bg-white"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={onKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={open}
                  aria-controls="autocomplete-listbox"
                />

                {/* Dropdown de sugerencias */}
                {open && (loading || suggestions.length > 0) && (
                  <div
                    ref={listRef}
                    id="autocomplete-listbox"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-xl border bg-white shadow"
                  >
                    {loading && (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando…
                      </div>
                    )}

                    {!loading &&
                      suggestions.map((sug, idx) => {
                        const sanitized = allowOnlyMark(sug.title);
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={sug.id}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            onClick={() => goToSuggestion(sug.id)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${isActive ? "bg-gray-100" : "hover:bg-gray-50"
                              }`}
                          >
                            <span
                              // Mostramos SOLO <mark> del backend
                              dangerouslySetInnerHTML={{ __html: sanitized }}
                              className="block leading-snug [&>mark]:bg-yellow-200/60 [&>mark]:px-0.5 [&>mark]:rounded"
                            />
                          </button>
                        );
                      })}

                    {!loading && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>

              <Button size="lg" className="px-6 bg-white text-black hover:bg-gray-200" onClick={submit}>
                Buscar
              </Button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-0.5 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-muted-foreground bg-white"
              >
                {showAdvanced ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Ocultar filtros
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Búsqueda avanzada
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white px-2 rounded-xl">
                <span>Presiona</span>
                <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">Enter</kbd>
                <span>para buscar</span>
              </div>
            </div>

            {showAdvanced && (
              <div className="sm:mt-5 grid grid-cols-2 sm:grid-cols-3  lg:grid-cols-6 gap-1">
                {/* Buscar en */}
                <div className="">
                  <div className="text-sm text-white sm:mb-1">Buscar en</div>
                  <Select value={searchIn} onValueChange={(v) => setSearchIn(v as any)}>
                    <SelectTrigger className="bg-white w-full">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="autores">Autores</SelectItem>
                      <SelectItem value="abstract">Resumen</SelectItem>
                      <SelectItem value="key_words">Palabras clave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar por */}
                <div className="hidden sm:flex sm:flex-col">
                  <div className="text-sm text-white sm:mb-1">Ordenar por</div>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="bg-white w-full">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="autores">Autores</SelectItem>
                      <SelectItem value="abstract">Resumen</SelectItem>
                      <SelectItem value="key_words">Palabras clave</SelectItem>
                      <SelectItem value="views">Vistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dirección */}
                <div>
                  <div className="text-sm text-white sm:mb-1">Dirección</div>
                  <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                    <SelectTrigger className="bg-white w-full">
                      <SelectValue placeholder="asc/desc" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="asc">Ascendente</SelectItem>
                      <SelectItem value="desc">Descendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo (repositorio) */}
                <div>
                  <div className="text-sm text-white mb-1">Tipo (repositorio)</div>
                  <Select value={repo} onValueChange={(v) => setRepo(v as any)}>
                    <SelectTrigger className="bg-white w-full">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="documento">Documentos</SelectItem>
                      <SelectItem value="mapa">Mapas</SelectItem>
                      <SelectItem value="dataset">Datasets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha desde */}
                <div>
                  <div className="text-sm text-white w-full mb-1">Desde (MM-AAAA)</div>
                  <input
                    type="month"
                    className="bg-white w-full h-10 rounded-md border px-3 text-sm"
                    value={dateFrom}
                    // opcional: limita máximo al "hasta"
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Fecha hasta */}
                <div>
                  <div className="text-sm text-white mb-1">Hasta (MM-AAAA)</div>
                  <input
                    type="month"
                    className="bg-white w-full h-10 rounded-md border px-3 text-sm"
                    value={dateTo}
                    // opcional: limita mínimo al "desde"
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                {/* error de fechas */}
                {dateError && (
                  <div className="col-span-full text-sm text-red-600 bg-white/80 rounded px-3 py-2">
                    {dateError}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

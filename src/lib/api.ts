// src/lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/env";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
const AUTH_ENDPOINTS = ["/auth/login", "/auth/logout", "/auth/refresh", "/auth/callback"];
const isAuthEndpoint = (url?: string) => !!url && AUTH_ENDPOINTS.some(e => url.endsWith(e));

/** Instancia cookies-only */
export const api = axios.create({
  baseURL: API_BASE_URL,    
  withCredentials: true,    
  timeout: 20000,
  // Si tu backend usa CSRF/XSRF cookie -> header, habilita:
  // xsrfCookieName: "XSRF-zTOKEN",
  // xsrfHeaderName: "X-XSRF-TOKEN",
});

/** Callbacks para integrarse con el AuthContext (opcionales) */
let onRefreshed: ((payload: any) => void) | null = null;
let onUnauthorized: (() => void) | null = null;
export const setRefreshedHandler = (fn: ((payload: any) => void) | null) => { onRefreshed = fn; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

/** Interceptor: request */
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  (config.headers as any).Accept = "application/json";
  
  return config;
});

/** Interceptor: response + refresh con cola */
let isRefreshing = false;
let queue: { resolve: (v: any) => void; reject: (r?: any) => void; config: RetriableConfig }[] = [];
const flush = (err: any | null) => { const q = [...queue]; queue = []; q.forEach(({ resolve, reject, config }) => err ? reject(err) : resolve(api.request(config))); };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const cfg = (error.config || {}) as RetriableConfig;

    // No refrescar si no es 401, si ya reintentamos, o si falló en /auth/*
    if (status !== 401 || cfg._retry || isAuthEndpoint(cfg.url)) {
      return Promise.reject(error);
    }
    cfg._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject, config: cfg }));
    }

    isRefreshing = true;
    try {
      // El backend debe leer cookies y devolver nuevas cookies + (opcional) user/roles/permisos
      const resp = await api.post("/auth/refresh");
      onRefreshed?.(resp.data);   // notifica al AuthContext si quieres actualizar user/roles

      flush(null);
      return api.request(cfg);    // reintenta la petición original
    } catch (err) {
      flush(err);

      // ⬇️ ANTES: onUnauthorized?.();  (siempre)
      const st = (err as any)?.response?.status;
      if (st === 401 || st === 419) {
        onUnauthorized?.();            // solo si realmente NO hay sesión válida
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// Logs útiles en dev (opcional)
if (import.meta.env.DEV) {
  console.debug("[api] baseURL:", api.defaults.baseURL, "withCredentials:", api.defaults.withCredentials);
  api.interceptors.request.use((cfg) => {
    console.debug("[API ->]", (cfg.method || "get").toUpperCase(), (cfg.baseURL || "") + (cfg.url || ""));
    return cfg;
  });
  api.interceptors.response.use(
    (res) => { console.debug("[API <-]", res.status, res.config.url); return res; },
    (err) => { console.debug("[API xx]", err.response?.status ?? "NETWORK", err.config?.url, err.response?.data || err.message); return Promise.reject(err); }
  );
}

export default api;
// src/lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/env";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
const AUTH_ENDPOINTS = ["/auth/login", "/auth/logout", "/auth/refresh", "/auth/callback"];
const isAuthEndpoint = (url?: string) => !!url && AUTH_ENDPOINTS.some(e => url.endsWith(e));

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/** Callbacks hacia AuthContext */
let onRefreshed: ((payload: any) => void) | null = null;
let onUnauthorized: (() => void) | null = null;
export const setRefreshedHandler = (fn: ((payload: any) => void) | null) => { onRefreshed = fn; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

/** Request interceptor */
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  (config.headers as any).Accept = "application/json";
  return config;
});

/** ---- Refresh controlado (una sola vez) ---- */
let _refreshPromise: Promise<any> | null = null;
let _lastRefreshAt = 0;
const REFRESH_COOLDOWN_MS = 10_000; // evita ráfagas (10s)

export async function refreshOnce(): Promise<any> {
  const now = Date.now();
  if (_refreshPromise) return _refreshPromise;
  if (now - _lastRefreshAt < REFRESH_COOLDOWN_MS) return null;
  _lastRefreshAt = now;

  _refreshPromise = api.post("/auth/refresh")
    .then((resp) => {
      onRefreshed?.(resp.data);
      return resp;
    })
    .finally(() => { _refreshPromise = null; });

  return _refreshPromise;
}

/** Cola para reintentar peticiones que fallaron con 401 mientras se refresca */
let queue: { resolve: (v: any) => void; reject: (r?: any) => void; config: RetriableConfig }[] = [];
const flush = (err: any | null) => {
  const q = [...queue];
  queue = [];
  q.forEach(({ resolve, reject, config }) => err ? reject(err) : resolve(api.request(config)));
};

/** Response interceptor con refreshOnce() */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const cfg = (error.config || {}) as RetriableConfig;

     if (cfg.url?.endsWith("/auth/refresh")) {
       if (!status || [401,403,404,419].includes(status)) {
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }

     if (status !== 401 || cfg._retry || isAuthEndpoint(cfg.url)) {
      return Promise.reject(error);
    }
    cfg._retry = true;

    if (_refreshPromise) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject, config: cfg }));
    }

    try {
      await refreshOnce();
      flush(null);
      return api.request(cfg);
    } catch (err: any) {
      flush(err);
      const st = err?.response?.status;
      if (!st || st === 401 || st === 419) onUnauthorized?.();
      return Promise.reject(err);
    }
  }
);

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
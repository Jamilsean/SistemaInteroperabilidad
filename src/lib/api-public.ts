// src/lib/api-public.ts
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // <- importantísimo
  timeout: 20000,
  headers: { Accept: "application/json" },
});

export default apiPublic;

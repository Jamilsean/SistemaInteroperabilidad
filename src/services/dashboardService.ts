import { API_BASE_URL } from "@/config/env";
import api from "@/lib/api";
import type { DashboardResponse } from "@/types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
const { data } = await api.get<DashboardResponse>(`${API_BASE_URL}/dashboard`);
return data;
}
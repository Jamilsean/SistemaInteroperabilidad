import api from "@/lib/api"
import { API_BASE_URL } from "@/config/env";
import type {
  HarvestTask,
  UpdateHarvestTaskPayload,
  ToggleTaskResponseRaw,
} from "@/types/task";

// Normaliza is_active a boolean
function normalizeTask<T extends { is_active: any }>(t: T): T & { is_active: boolean } {
  const v = t.is_active;
  let isActive = false;
  if (typeof v === "boolean") isActive = v;
  else if (typeof v === "string") {
    isActive = v === "1" || v.toLowerCase() === "true";
  } else if (typeof v === "number") {
    isActive = v === 1;
  }
  return { ...t, is_active: isActive };
}

export async function getHarvestTasks(): Promise<HarvestTask[]> {
  const { data } = await api.get<HarvestTask[]>(`${API_BASE_URL}/harvest-tasks`);
  // normaliza por si acaso
  return data.map(normalizeTask);
}

export async function updateHarvestTask(id: number, payload: UpdateHarvestTaskPayload): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(`${API_BASE_URL}/harvest-tasks/${id}`, payload);
  return data;
}

export async function toggleHarvestTask(id: number): Promise<HarvestTask> {
  const { data } = await api.post<ToggleTaskResponseRaw>(`${API_BASE_URL}/harvest-tasks/${id}/toggle`, {});
  return normalizeTask(data) as HarvestTask;
}

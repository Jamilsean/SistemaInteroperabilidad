import api from "@/lib/api";
import type { Harvest, HarvestsResponse } from "@/types/harvests";
 export type HarvestRepo = "dataverse" | "dspace" | "geonetwork";

export const listHarvests = async (): Promise<Harvest[]> => {
  const { data } = await api.get<HarvestsResponse>("/harvests");
  return data.data;
};

export const startHarvest = async (repo: string) => {
  const { data } = await api.post(`/harvests/${repo.toLowerCase()}`);
  return data;
};

export const getHarvests = async (page = 1, per_page = 10, repositorio_id: number[] = [], search = "", sort_by = "finished_at", sort_dir = "desc") => {
  const params: any = {
    page,
    per_page,
    repositorio_id,
    sort_by,
    sort_dir,
  };

  if (search) {
    params.search = search;
  }

  const { data } = await api.get<HarvestsResponse>(`/harvests`, { params });
  return data;
};
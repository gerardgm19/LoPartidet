import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";

export type Location = {
  id: number;
  name: string;
};

export async function getLocations(): Promise<Location[]> {
  const { data } = await apiClient.get<Location[]>(`${API_BASE_URL}/locations`);
  return data;
}

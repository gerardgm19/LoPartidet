import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";

export type Location = {
  id: number;
  name: string;
  description: string;
};

export type LocationPayload = {
  name: string;
  description: string;
};

export async function getLocations(): Promise<Location[]> {
  const { data } = await apiClient.get<Location[]>(`${API_BASE_URL}/locations`);
  return data;
}

export async function createLocation(payload: LocationPayload): Promise<Location> {
  const { data } = await apiClient.post<Location>(`${API_BASE_URL}/locations`, payload);
  return data;
}

export async function updateLocation(id: number, payload: LocationPayload): Promise<Location> {
  const { data } = await apiClient.put<Location>(`${API_BASE_URL}/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: number): Promise<void> {
  await apiClient.delete(`${API_BASE_URL}/locations/${id}`);
}

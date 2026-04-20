import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";

export type User = {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  city: string;
};

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const { data } = await apiClient.get<User>(`${API_BASE_URL}/users/${id}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

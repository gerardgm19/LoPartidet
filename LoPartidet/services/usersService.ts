import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";
import { Position } from "@/types/position";
import { PreferredFoot } from "@/types/preferredFoot";
import { SkillLevel } from "@/types/skillLevel";
import { PlayerSpeed } from "@/types/playerSpeed";

export type User = {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  city: string;
  birthday?: string;
  position?: Position;
  preferredFoot?: PreferredFoot;
  skillLevel?: SkillLevel;
  speed?: PlayerSpeed;
  jerseyNumber?: number;
  height?: number;
};

export type UpdateUserRequest = {
  name?: string;
  surname?: string;
  nickname?: string;
  email?: string;
  city?: string;
  birthday?: string;
  position?: Position;
  preferredFoot?: PreferredFoot;
  skillLevel?: SkillLevel;
  speed?: PlayerSpeed;
  jerseyNumber?: number;
  height?: number;
};

export async function getMe(): Promise<User | undefined> {
  try {
    const { data } = await apiClient.get<User>(`${API_BASE_URL}/users/me`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const { data } = await apiClient.get<User>(`${API_BASE_URL}/users/${id}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

export async function updateUser(id: number, request: UpdateUserRequest): Promise<User> {
  const { data } = await apiClient.put<User>(`${API_BASE_URL}/users/${id}`, request);
  return data;
}

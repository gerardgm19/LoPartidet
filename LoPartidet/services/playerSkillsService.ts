import { API_BASE_URL } from "@/constants/env";
import { Position } from "@/types/position";
import { PreferredFoot } from "@/types/preferredFoot";
import { SkillLevel } from "@/types/skillLevel";
import { PlayerSpeed } from "@/types/playerSpeed";
import { apiClient } from "./api";

export type PlayerSkill = {
  id: string;
  userId: number;
  position: Position | null;
  preferredFoot: PreferredFoot | null;
  skillLevel: SkillLevel | null;
  speed: PlayerSpeed | null;
  jerseyNumber: number | null;
  height: number | null;
};

export type UpdatePlayerSkillRequest = {
  position: Position | null;
  preferredFoot: PreferredFoot | null;
  skillLevel: SkillLevel | null;
  speed: PlayerSpeed | null;
  jerseyNumber: number | null;
  height: number | null;
};

export type CreatePlayerSkillRequest = {
  userId: number;
  position: Position | null;
  preferredFoot: PreferredFoot | null;
  skillLevel: SkillLevel | null;
  speed: PlayerSpeed | null;
  jerseyNumber: number | null;
  height: number | null;
};

export async function getPlayerSkillsByUser(userId: string): Promise<PlayerSkill[]> {
  const { data } = await apiClient.get<PlayerSkill[]>(
    `${API_BASE_URL}/player-skills/user/${userId}`
  );
  return data;
}

export async function createPlayerSkill(
  request: CreatePlayerSkillRequest
): Promise<PlayerSkill> {
  const { data } = await apiClient.post<PlayerSkill>(
    `${API_BASE_URL}/player-skills`,
    request
  );
  return data;
}

export async function updatePlayerSkill(
  id: string,
  request: UpdatePlayerSkillRequest
): Promise<PlayerSkill> {
  const { data } = await apiClient.put<PlayerSkill>(
    `${API_BASE_URL}/player-skills/${id}`,
    request
  );
  return data;
}

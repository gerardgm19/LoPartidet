import { Platform } from "react-native";
import { SportType } from "@/types/sportType";
import { MatchStatus } from "@/types/matchStatus";
import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";
import { useAuthStore } from "@/store/authStore";


export type Match = {
  id: string;
  createdBy: string;
  createdAt: string;
  type: SportType;
  date: string;
  location: string;
  maxPlayers: number;
  status: MatchStatus;
};

export type CreateMatchRequest = {
  type: SportType;
  date: string;
  location: string;
  maxPlayers: number;
};

// ---------------------------------------------------------------------------
// Normalization — API may return enums as strings or numbers
// ---------------------------------------------------------------------------

function normalizeMatch(raw: any): Match {
  return {
    ...raw,
    type:
      typeof raw.type === "string"
        ? SportType[raw.type as keyof typeof SportType]
        : raw.type,
    status:
      typeof raw.status === "string"
        ? MatchStatus[raw.status as keyof typeof MatchStatus]
        : raw.status,
  };
}

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  const { data } = await apiClient.get<any[]>(`${API_BASE_URL}/matches`);
  return data.map(normalizeMatch);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  try {
    const { data } = await apiClient.get<any>(`${API_BASE_URL}/matches/${id}`);
    return normalizeMatch(data);
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

export async function createMatch(request: CreateMatchRequest): Promise<Match> {
  const createdBy = useAuthStore.getState().userId ?? "";
  const { data } = await apiClient.post<any>(`${API_BASE_URL}/matches`, {
    type: request.type,
    date: request.date,
    location: request.location,
    createdBy,
    maxPlayers: request.maxPlayers,
  });
  return normalizeMatch(data);
}

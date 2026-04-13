import { FootballType } from "@/types/footballType";
import { MatchStatus } from "@/types/matchStatus";
import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";

export type { FootballType };
export type { MatchStatus };

export type Match = {
  id: string;
  footballType: FootballType;
  date: string;
  location: string;
  organizer: string;
  joinedCount: number;
  maxPeople: number;
  isJoined: boolean;
  status: MatchStatus;
};

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  const { data } = await apiClient.get<Match[]>(`${API_BASE_URL}/matches`);
  return data;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  try {
    const { data } = await apiClient.get<Match>(`${API_BASE_URL}/matches/${id}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

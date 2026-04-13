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
// Normalization — the API may return enum values as strings or numbers
// depending on backend serialization settings. This ensures the FE always
// works with numeric enum values regardless.
// ---------------------------------------------------------------------------

function normalizeMatch(raw: any): Match {
  return {
    ...raw,
    footballType:
      typeof raw.footballType === "string"
        ? FootballType[raw.footballType as keyof typeof FootballType]
        : raw.footballType,
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

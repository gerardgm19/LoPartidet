import { Platform } from "react-native";
import { FootballType } from "@/types/footballType";
import { MatchStatus } from "@/types/matchStatus";
import { apiClient } from "./api";

export type { FootballType };
export type { MatchStatus };

// Android emulator routes localhost traffic to 10.0.2.2 (the host machine).
// iOS simulator can reach the host directly via localhost.
const DEBUG_API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5145"
    : "http://localhost:5145";

const PROD_API_BASE_URL = "http://178.33.119.182:5145";

const isDebug = true;

const API_BASE_URL = isDebug ? DEBUG_API_BASE_URL : PROD_API_BASE_URL;

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

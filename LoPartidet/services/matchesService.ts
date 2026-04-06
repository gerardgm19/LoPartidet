import { Platform } from "react-native";

// Android emulator routes localhost traffic to 10.0.2.2 (the host machine).
// iOS simulator can reach the host directly via localhost.
const DEBUG_API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5145"
    : "http://localhost:5145";

const PROD_API_BASE_URL = "http://178.33.119.182:5145"

const isDebug = true;

const API_BASE_URL = isDebug ? DEBUG_API_BASE_URL : PROD_API_BASE_URL;

export type FootballType = "Fut5" | "Fut7" | "Fut11" | "Futsal" | "Beach" | "Indoor";

export type Match = {
  id: string;
  footballType: FootballType;
  date: string;
  location: string;
  organizer: string;
  joinedCount: number;
  maxPeople: number;
  isJoined: boolean;
  status: "Scheduled" | "Live" | "Finished";
};

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  console.log("calls")
  const response = await fetch(`${API_BASE_URL}/matches`);
  return response.json();
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`);
  if (response.status === 404) return undefined;
  return response.json();
}

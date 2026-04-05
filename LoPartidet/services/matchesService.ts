const API_BASE_URL = "http://localhost:5000";

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
  const response = await fetch(`${API_BASE_URL}/matches`);
  return response.json();
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`);
  if (response.status === 404) return undefined;
  return response.json();
}

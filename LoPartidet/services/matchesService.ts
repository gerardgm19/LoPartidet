import { MOCK_MATCHES } from "@/mocks/matches.mock";

export type FootballType = "fut5" | "fut7" | "fut11" | "futsal" | "beach" | "indoor";

export type Match = {
  id: string;
  footballType: FootballType;
  date: string;
  location: string;
  organizer: string;
  joinedCount: number;
  maxPeople: number;
  isJoined: boolean;
  status: "scheduled" | "live" | "finished";
};

// ---------------------------------------------------------------------------
// Data source
// Toggle USE_MOCK to false and fill in the API functions below when the
// backend is ready. Everything above this block stays untouched.
// ---------------------------------------------------------------------------

const USE_MOCK = true;

// -- Mock adapter -----------------------------------------------------------

const mockAdapter = {
  async getAll(): Promise<Match[]> {
    return MOCK_MATCHES;
  },
  async getById(id: string): Promise<Match | undefined> {
    return MOCK_MATCHES.find((m) => m.id === id);
  },
};

// -- API adapter (fill in when backend is ready) ----------------------------

const apiAdapter = {
  async getAll(): Promise<Match[]> {
    // TODO: replace with real endpoint
    // const response = await fetch("https://api.example.com/matches");
    // return response.json();
    throw new Error("API not implemented yet");
  },
  async getById(id: string): Promise<Match | undefined> {
    // TODO: replace with real endpoint
    // const response = await fetch(`https://api.example.com/matches/${id}`);
    // return response.json();
    throw new Error("API not implemented yet");
  },
};

const source = USE_MOCK ? mockAdapter : apiAdapter;

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  return source.getAll();
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  return source.getById(id);
}

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  location: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
};

// In-memory store — replace with API/DB calls as needed
const matches: Match[] = [];

export function getMatches(): Match[] {
  return matches;
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function createMatch(data: Omit<Match, "id">): Match {
  const match: Match = { ...data, id: Date.now().toString() };
  matches.push(match);
  return match;
}

export function updateMatch(id: string, data: Partial<Omit<Match, "id">>): Match | undefined {
  const index = matches.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  matches[index] = { ...matches[index], ...data };
  return matches[index];
}

export function deleteMatch(id: string): boolean {
  const index = matches.findIndex((m) => m.id === id);
  if (index === -1) return false;
  matches.splice(index, 1);
  return true;
}

import { SportType } from "@/types/sportType";
import { TournamentStatus } from "@/types/tournamentStatus";
import { TournamentPhase } from "@/types/tournamentPhase";
import { API_BASE_URL } from "@/constants/env";
import { apiClient } from "./api";

export type Tournament = {
  id: number;
  name: string;
  sportType: SportType;
  status: TournamentStatus;
  createdById: number;
  startDate: string;
  groupsCount: number;
  teamsPerGroup: number;
  qualifiedPerGroup: number;
  isSingleElimination: boolean;
  hasThirdPlaceMatch: boolean;
  halfDurationMinutes: number;
  halfTimeDurationMinutes: number;
  gapBetweenMatchesMinutes: number;
  isCurrentUserInTeam?: boolean;
  locations?: TournamentLocationInfo[];
};

export type TournamentLocationInfo = {
  id: number;
  name: string;
};

function normalizeTournament(raw: any): Tournament {
  return {
    ...raw,
    sportType:
      typeof raw.sportType === "string"
        ? SportType[raw.sportType as keyof typeof SportType]
        : raw.sportType,
    status:
      typeof raw.status === "string"
        ? TournamentStatus[raw.status as keyof typeof TournamentStatus]
        : raw.status,
  };
}

export type CreateTournamentRequest = {
  name: string;
  sportType: SportType;
  createdBy: string;
  startDate: string;
  groupsCount: number;
  teamsPerGroup: number;
  qualifiedPerGroup: number;
  isSingleElimination: boolean;
  hasThirdPlaceMatch: boolean;
  halfDurationMinutes: number;
  halfTimeDurationMinutes: number;
  gapBetweenMatchesMinutes: number;
};

export async function getTournaments(): Promise<Tournament[]> {
  const { data } = await apiClient.get<any[]>(`${API_BASE_URL}/tournaments`);
  return data.map(normalizeTournament);
}

export async function createTournament(request: CreateTournamentRequest): Promise<Tournament> {
  const { data } = await apiClient.post<any>(`${API_BASE_URL}/tournaments`, request);
  return normalizeTournament(data);
}

export type UpdateTournamentRequest = {
  name: string;
  sportType: SportType;
  startDate: string;
  groupsCount: number;
  teamsPerGroup: number;
  qualifiedPerGroup: number;
  isSingleElimination: boolean;
  hasThirdPlaceMatch: boolean;
  halfDurationMinutes: number;
  halfTimeDurationMinutes: number;
  gapBetweenMatchesMinutes: number;
  locationIds: number[];
};

export async function updateTournament(id: string, request: UpdateTournamentRequest): Promise<Tournament> {
  const { data } = await apiClient.put<any>(`${API_BASE_URL}/tournaments/${id}`, request);
  return normalizeTournament(data);
}

export type TournamentTeam = {
  id: number;
  name: string;
  tournamentId: number;
  groupId: number | null;
  createdById: number;
  isUserTeam: boolean;
};

export async function getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const { data } = await apiClient.get<TournamentTeam[]>(`${API_BASE_URL}/tournaments/${tournamentId}/teams`);
  return data;
}

export type CreateTeamRequest = {
  name: string;
  createdBy: string;
  memberUserIds: number[] | null;
};

export async function addTeam(tournamentId: string, request: CreateTeamRequest): Promise<TournamentTeam> {
  const { data } = await apiClient.post<TournamentTeam>(
    `${API_BASE_URL}/tournaments/${tournamentId}/teams`,
    request
  );
  return data;
}

export async function generateTestTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const { data } = await apiClient.post<TournamentTeam[]>(
    `${API_BASE_URL}/tournaments/${tournamentId}/test-teams`
  );
  return data;
}

export type PreviewTeam = {
  id: number;
  name: string;
};

export type PreviewGroup = {
  name: string;
  phase: TournamentPhase;
  teams: PreviewTeam[];
};

export type PreviewMatch = {
  groupName: string;
  phase: TournamentPhase;
  bracketSlot: number | null;
  teamAId: number | null;
  teamAName: string | null;
  teamAScore: number | null;
  teamBId: number | null;
  teamBName: string | null;
  teamBScore: number | null;
  tournamentLocationId: number;
  date: string;
};

export type TournamentPreview = {
  groups: PreviewGroup[];
  groupStageMatches: PreviewMatch[];
  bracketMatches: PreviewMatch[];
};

export async function getTestTournamentGroupsAndMatches(tournamentId: string): Promise<TournamentPreview> {
  const { data } = await apiClient.get<TournamentPreview>(
    `${API_BASE_URL}/tournaments/${tournamentId}/preview`
  );
  return data;
}

// Real (persisted) tournament data — superset of the preview shape with real DB ids.
export type ResultGroup = PreviewGroup & { id: number };
export type ResultMatch = PreviewMatch & { id: number; groupId: number };

export type TournamentData = {
  groups: ResultGroup[];
  groupStageMatches: ResultMatch[];
  bracketMatches: ResultMatch[];
};

// Generates and persists groups, matches and the bracket; flips the tournament to GroupStage.
export async function generateTournamentData(tournamentId: string): Promise<TournamentData> {
  const { data } = await apiClient.post<TournamentData>(
    `${API_BASE_URL}/tournaments/${tournamentId}/generate`
  );
  return data;
}

// Reads the already-generated real data.
export async function getTournamentResults(tournamentId: string): Promise<TournamentData> {
  const { data } = await apiClient.get<TournamentData>(
    `${API_BASE_URL}/tournaments/${tournamentId}/results`
  );
  return data;
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  try {
    const { data } = await apiClient.get<any>(`${API_BASE_URL}/tournaments/${id}`);
    return normalizeTournament(data);
  } catch {
    return undefined;
  }
}

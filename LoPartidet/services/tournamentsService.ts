import { SportType } from "@/types/sportType";
import { TournamentStatus } from "@/types/tournamentStatus";
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

export type TournamentTeam = {
  id: number;
  name: string;
  tournamentId: number;
  groupId: number | null;
  createdById: number;
  memberUserIds: number[];
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

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  try {
    const { data } = await apiClient.get<any>(`${API_BASE_URL}/tournaments/${id}`);
    return normalizeTournament(data);
  } catch {
    return undefined;
  }
}

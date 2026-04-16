import { Match } from "@/services/matchesService";
import { SportType } from "@/types/sportType";
import { MatchStatus } from "@/types/matchStatus";

export const MOCK_MATCHES: Match[] = [
  {
    id: "1",
    createdBy: "user-001",
    createdAt: "2026-04-01T10:00:00Z",
    type: SportType.Fut7,
    date: "2026-04-10T20:00:00Z",
    location: "Poliesportiu Les Corts, Barcelona",
    maxPlayers: 14,
    status: MatchStatus.Scheduled,
  },
  {
    id: "2",
    createdBy: "user-002",
    createdAt: "2026-04-02T09:00:00Z",
    type: SportType.Fut5,
    date: "2026-04-08T19:45:00Z",
    location: "Pista Municipal Nord, Madrid",
    maxPlayers: 10,
    status: MatchStatus.Live,
  },
  {
    id: "3",
    createdBy: "user-003",
    createdAt: "2026-04-03T11:00:00Z",
    type: SportType.Futsal,
    date: "2026-04-06T17:30:00Z",
    location: "Pavelló Can Zam, Santa Coloma",
    maxPlayers: 12,
    status: MatchStatus.Finished,
  },
  {
    id: "4",
    createdBy: "user-001",
    createdAt: "2026-04-04T08:30:00Z",
    type: SportType.Fut11,
    date: "2026-04-12T11:00:00Z",
    location: "Camp Municipal de Futbol, Badalona",
    maxPlayers: 22,
    status: MatchStatus.Scheduled,
  },
  {
    id: "5",
    createdBy: "user-004",
    createdAt: "2026-04-05T12:00:00Z",
    type: SportType.Beach,
    date: "2026-04-13T10:30:00Z",
    location: "Platja de la Barceloneta, Barcelona",
    maxPlayers: 10,
    status: MatchStatus.Scheduled,
  },
];

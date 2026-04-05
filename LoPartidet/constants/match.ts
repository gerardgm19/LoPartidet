import { Match } from "@/services/matchesService";
import { Colors } from "@/constants/colors";

export const FOOTBALL_TYPE_LABEL: Record<Match["footballType"], string> = {
  Fut5:   "Fut 5",
  Fut7:   "Fut 7",
  Fut11:  "Fut 11",
  Futsal: "Futsal",
  Beach:  "Beach",
  Indoor: "Indoor",
};

export const STATUS_CONFIG: Record<
  Match["status"],
  { label: string; bg: string; fg: string }
> = {
  Live:      { label: "Live",      bg: Colors.green,  fg: Colors.black },
  Scheduled: { label: "Scheduled", bg: Colors.border, fg: Colors.muted },
  Finished:  { label: "Finished",  bg: Colors.border, fg: Colors.muted },
};

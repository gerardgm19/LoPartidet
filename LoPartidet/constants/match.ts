import { Match } from "@/services/matchesService";
import { Colors } from "@/constants/colors";

export const FOOTBALL_TYPE_LABEL: Record<Match["footballType"], string> = {
  fut5:   "Fut 5",
  fut7:   "Fut 7",
  fut11:  "Fut 11",
  futsal: "Futsal",
  beach:  "Beach",
  indoor: "Indoor",
};

export const STATUS_CONFIG: Record<
  Match["status"],
  { label: string; bg: string; fg: string }
> = {
  live:      { label: "Live",      bg: Colors.green,  fg: Colors.black },
  scheduled: { label: "Scheduled", bg: Colors.border, fg: Colors.muted },
  finished:  { label: "Finished",  bg: Colors.border, fg: Colors.muted },
};

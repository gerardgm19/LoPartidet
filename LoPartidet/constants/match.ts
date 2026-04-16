import { Colors } from "@/constants/colors";
import { Translations } from "@/i18n";
import { SportType } from "@/types/sportType";
import { MatchStatus } from "@/types/matchStatus";

export function getSportTypeLabel(t: Translations): Record<SportType, string> {
  return {
    [SportType.Fut5]:   t.sportTypeFut5,
    [SportType.Fut7]:   t.sportTypeFut7,
    [SportType.Fut11]:  t.sportTypeFut11,
    [SportType.Futsal]: t.sportTypeFutsal,
    [SportType.Beach]:  t.sportTypeBeach,
    [SportType.Indoor]: t.sportTypeIndoor,
  };
}

export function getStatusConfig(t: Translations): Record<
  MatchStatus,
  { label: string; bg: string; fg: string }
> {
  return {
    [MatchStatus.Live]:      { label: t.statusLive,      bg: Colors.green,  fg: Colors.black },
    [MatchStatus.Scheduled]: { label: t.statusScheduled, bg: Colors.border, fg: Colors.muted },
    [MatchStatus.Finished]:  { label: t.statusFinished,  bg: Colors.border, fg: Colors.muted },
  };
}

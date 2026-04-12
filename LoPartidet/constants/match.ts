import { Colors } from "@/constants/colors";
import { Translations } from "@/i18n";
import { FootballType } from "@/types/footballType";
import { MatchStatus } from "@/types/matchStatus";

export function getFootballTypeLabel(t: Translations): Record<FootballType, string> {
  return {
    [FootballType.Fut5]:   t.footballTypeFut5,
    [FootballType.Fut7]:   t.footballTypeFut7,
    [FootballType.Fut11]:  t.footballTypeFut11,
    [FootballType.Futsal]: t.footballTypeFutsal,
    [FootballType.Beach]:  t.footballTypeBeach,
    [FootballType.Indoor]: t.footballTypeIndoor,
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

import { ColorPalette } from "@/constants/colors";
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

export function getStatusConfig(
  t: Translations,
  colors: ColorPalette,
): Record<MatchStatus, { label: string; bg: string; fg: string }> {
  return {
    [MatchStatus.Live]:      { label: t.statusLive,      bg: colors.green,  fg: colors.black },
    [MatchStatus.Scheduled]: { label: t.statusScheduled, bg: colors.border, fg: colors.muted },
    [MatchStatus.Finished]:  { label: t.statusFinished,  bg: colors.border, fg: colors.muted },
  };
}

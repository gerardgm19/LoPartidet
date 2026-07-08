import { ColorPalette } from "@/constants/colors";
import { Translations } from "@/i18n";
import { TournamentStatus } from "@/types/tournamentStatus";

export function getTournamentStatusConfig(
  t: Translations,
  colors: ColorPalette,
): Record<TournamentStatus, { label: string; bg: string; fg: string }> {
  return {
    [TournamentStatus.Draft]:      { label: t.tournamentStatusDraft,      bg: colors.border, fg: colors.muted },
    [TournamentStatus.GroupStage]: { label: t.tournamentStatusGroupStage, bg: "#1a3a5c",     fg: "#4da6ff" },
    [TournamentStatus.Knockout]:   { label: t.tournamentStatusKnockout,   bg: "#3a1a1a",     fg: "#ff6b6b" },
    [TournamentStatus.Finished]:   { label: t.tournamentStatusFinished,   bg: colors.green,  fg: colors.black },
  };
}

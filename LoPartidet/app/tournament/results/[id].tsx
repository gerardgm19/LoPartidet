import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import { makeStyles } from "@/utils/makeStyles";
import { formatDateShort } from "@/utils/formatDate";
import { Toast } from "@/components/Toast";
import { TournamentPhase } from "@/types/tournamentPhase";
import {
  getTestTournamentGroupsAndMatches,
  PreviewMatch,
  TournamentPreview,
} from "@/services/tournamentsService";

type Tab = "groups" | "knockout";

// Bracket rounds are shown left-to-right in this order.
const BRACKET_PHASE_ORDER: TournamentPhase[] = [
  TournamentPhase.RoundOf16,
  TournamentPhase.QuarterFinal,
  TournamentPhase.SemiFinal,
  TournamentPhase.ThirdPlace,
  TournamentPhase.Final,
];

// Standings stat columns. Values are 0 for every team: the preview has no played results.
const STAT_KEYS = [
  "standingsPlayed",
  "standingsWon",
  "standingsDraw",
  "standingsLost",
  "standingsGoalsFor",
  "standingsGoalsAgainst",
  "standingsGoalDiff",
  "standingsPoints",
] as const;

function groupLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function usePhaseLabel() {
  const t = useLangStore((s) => s.t);
  return (phase: TournamentPhase): string => {
    switch (phase) {
      case TournamentPhase.RoundOf16: return t.phaseRoundOf16;
      case TournamentPhase.QuarterFinal: return t.phaseQuarterFinal;
      case TournamentPhase.SemiFinal: return t.phaseSemiFinal;
      case TournamentPhase.Final: return t.phaseFinal;
      case TournamentPhase.ThirdPlace: return t.phaseThirdPlace;
      default: return "";
    }
  };
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: "center", alignItems: "center",
  },
  navTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  navPlaceholder: { width: 38 },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: colors.green },
  tabText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.white, fontWeight: "800" },

  scroll: { padding: 16, gap: 20 },

  // Groups
  groupBlock: { gap: 8 },
  groupTitle: { color: colors.white, fontSize: 18, fontWeight: "800" },
  standingsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamRowFirst: { borderTopWidth: 0 },
  rankCell: { width: 22, color: colors.muted, fontSize: 13, fontWeight: "700" },
  teamCell: { width: 132, flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: colors.black, fontSize: 11, fontWeight: "800" },
  teamName: { color: colors.white, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  statCell: { width: 34, textAlign: "center", color: colors.white, fontSize: 13 },
  statCellStrong: { fontWeight: "800" },
  headerCellText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  last5Cell: { width: 104, flexDirection: "row", justifyContent: "center", gap: 5 },
  last5Dot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: colors.border,
  },

  // Knockout
  bracketRow: { flexDirection: "row", gap: 16, paddingRight: 16 },
  roundColumn: { width: 200, gap: 14 },
  roundTitle: { color: colors.white, fontSize: 14, fontWeight: "700", textAlign: "center" },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  matchDate: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  matchTeamRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  matchAvatar: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  matchTeamName: { color: colors.white, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  matchTeamNameTbd: { color: colors.muted, fontWeight: "500" },

  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 32 },
}));

export default function TournamentResultsPage() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const phaseLabel = usePhaseLabel();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [preview, setPreview] = useState<TournamentPreview | undefined>();
  const [tab, setTab] = useState<Tab>("groups");
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getTestTournamentGroupsAndMatches(id)
      .then(setPreview)
      .catch(() => setToastVisible(true))
      .finally(() => setLoading(false));
  }, [id]);

  const rounds = (preview?.bracketMatches ?? []).length > 0
    ? BRACKET_PHASE_ORDER
        .map((phase) => ({
          phase,
          matches: preview!.bracketMatches
            .filter((m) => m.phase === phase)
            .sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0)),
        }))
        .filter((r) => r.matches.length > 0)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>{t.resultsTitle}</Text>
        <View style={styles.navPlaceholder} />
      </View>

      <View style={styles.tabBar}>
        <Pressable style={[styles.tab, tab === "groups" && styles.tabActive]} onPress={() => setTab("groups")}>
          <Text style={[styles.tabText, tab === "groups" && styles.tabTextActive]}>{t.tabGroupStage}</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "knockout" && styles.tabActive]} onPress={() => setTab("knockout")}>
          <Text style={[styles.tabText, tab === "knockout" && styles.tabTextActive]}>{t.tabKnockout}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : tab === "groups" ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {(preview?.groups ?? []).map((group, gi) => (
            <View key={group.name} style={styles.groupBlock}>
              <Text style={styles.groupTitle}>{t.groupLabel} {groupLetter(gi)}</Text>
              <View style={styles.standingsCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={styles.headerRow}>
                      <Text style={styles.rankCell}> </Text>
                      <Text style={[styles.teamCell, styles.headerCellText]}>{t.standingsTeam}</Text>
                      {STAT_KEYS.map((key) => (
                        <Text key={key} style={[styles.statCell, styles.headerCellText]}>{t[key]}</Text>
                      ))}
                      <Text style={[styles.last5Cell, styles.headerCellText]}>{t.standingsLast5}</Text>
                    </View>
                    {group.teams.map((team, ti) => (
                      <View key={team.id} style={[styles.teamRow, ti === 0 && styles.teamRowFirst]}>
                        <Text style={styles.rankCell}>{ti + 1}</Text>
                        <View style={styles.teamCell}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{team.name[0]?.toUpperCase() ?? "?"}</Text>
                          </View>
                          <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
                        </View>
                        {STAT_KEYS.map((key) => (
                          <Text
                            key={key}
                            style={[styles.statCell, key === "standingsPoints" && styles.statCellStrong]}
                          >
                            0
                          </Text>
                        ))}
                        <View style={styles.last5Cell}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <View key={i} style={styles.last5Dot} />
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {rounds.length === 0 ? (
            <Text style={styles.emptyText}>{t.tournamentNoTeams}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.bracketRow}>
                {rounds.map((round) => (
                  <View key={round.phase} style={styles.roundColumn}>
                    <Text style={styles.roundTitle}>{phaseLabel(round.phase)}</Text>
                    {round.matches.map((match, mi) => (
                      <BracketCard key={mi} match={match} styles={styles} t={t} />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </ScrollView>
      )}

      <Toast message={t.tournamentError} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

function BracketCard({
  match,
  styles,
  t,
}: {
  match: PreviewMatch;
  styles: ReturnType<typeof useStyles>;
  t: ReturnType<typeof useLangStore.getState>["t"];
}) {
  const { day, time } = formatDateShort(match.date);
  const teams = [
    { name: match.teamAName },
    { name: match.teamBName },
  ];
  return (
    <View style={styles.matchCard}>
      <Text style={styles.matchDate}>{day} · {time}</Text>
      {teams.map((team, i) => (
        <View key={i} style={styles.matchTeamRow}>
          <View style={styles.matchAvatar}>
            <Text style={styles.avatarText}>{team.name ? team.name[0]?.toUpperCase() : "?"}</Text>
          </View>
          <Text
            style={[styles.matchTeamName, !team.name && styles.matchTeamNameTbd]}
            numberOfLines={1}
          >
            {team.name ?? t.toBeDefined}
          </Text>
        </View>
      ))}
    </View>
  );
}

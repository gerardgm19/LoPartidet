import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel } from "@/constants/match";
import { getTournamentById, getTournamentTeams, Tournament, TournamentTeam } from "@/services/tournamentsService";
import { TournamentStatus } from "@/types/tournamentStatus";
import { DetailRow } from "@/components/DetailRow";
import { formatDateShort } from "@/utils/formatDate";
import { Toast } from "@/components/Toast";
import { useLangStore } from "@/store/langStore";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.muted, fontSize: 16 },
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
  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    gap: 10,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { backgroundColor: colors.green, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { color: colors.black, fontSize: 13, fontWeight: "800", letterSpacing: 0.3 },
  statusBadge: {
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  heroName: { color: colors.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  heroDate: { color: colors.muted, fontSize: 14, fontWeight: "500" },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  boolRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  boolRowFirst: { borderTopWidth: 0 },
  boolLabel: { color: colors.muted, fontSize: 14 },
  boolValue: { fontSize: 13, fontWeight: "700" },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 16,
  },
  sectionTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  sectionCount: { color: colors.muted, fontSize: 13 },
  teamRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  teamAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
  },
  teamAvatarText: { color: colors.black, fontSize: 13, fontWeight: "800" },
  teamName: { color: colors.white, fontSize: 14, fontWeight: "600" },
  teamMeta: { color: colors.muted, fontSize: 12 },
  noTeamsText: { color: colors.muted, fontSize: 14, paddingVertical: 16, textAlign: "center" },
  joinButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  joinButtonDisabled: { backgroundColor: colors.border },
  joinButtonText: { color: colors.black, fontSize: 16, fontWeight: "800" },
  joinButtonTextDisabled: { color: colors.muted },
}));

function getStatusConfig(t: any, colors: any): Record<TournamentStatus, { label: string; bg: string; fg: string }> {
  return {
    [TournamentStatus.Draft]:      { label: t.tournamentStatusDraft,       bg: colors.border,  fg: colors.muted },
    [TournamentStatus.GroupStage]: { label: t.tournamentStatusGroupStage,  bg: "#1a3a5c",      fg: "#4da6ff" },
    [TournamentStatus.Knockout]:   { label: t.tournamentStatusKnockout,    bg: "#3a1a1a",      fg: "#ff6b6b" },
    [TournamentStatus.Finished]:   { label: t.tournamentStatusFinished,    bg: colors.border,  fg: colors.muted },
  };
}

export default function TournamentDetailPage() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | undefined>();
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    Promise.all([getTournamentById(id), getTournamentTeams(id)])
      .then(([tournamentData, teamsData]) => {
        setTournament(tournamentData);
        setTeams(teamsData);
        if (!tournamentData) { setToastMessage(t.tournamentError); setToastVisible(true); }
      })
      .catch(() => { setToastMessage(t.tournamentError); setToastVisible(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Pressable style={styles.backButton} onPress={() => router.replace("/(tabs)/tournaments")}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.tournamentNotFound}</Text>
        </View>
        <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
      </SafeAreaView>
    );
  }

  const sportTypeLabel = getSportTypeLabel(t);
  const statusCfg = getStatusConfig(t, colors)[tournament.status];
  const { day, time } = formatDateShort(tournament.startDate);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.replace("/(tabs)/tournaments")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>{t.tournamentDetails}</Text>
        <View style={styles.navPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{sportTypeLabel[tournament.sportType]}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusText, { color: statusCfg.fg }]}>{statusCfg.label}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{tournament.name}</Text>
          <Text style={styles.heroDate}>{day}  ·  {time}</Text>
        </View>

        <View style={styles.section}>
          <DetailRow icon="calendar-outline" label={t.tournamentStartDate} value={`${day}  ${time}`} />
          <DetailRow icon="football-outline" label={t.format} value={sportTypeLabel[tournament.sportType]} />
          <DetailRow icon="layers-outline" label={t.tournamentGroups} value={String(tournament.groupsCount)} />
          <DetailRow icon="people-outline" label={t.tournamentTeamsPerGroup} value={String(tournament.teamsPerGroup)} />
          <DetailRow icon="medal-outline" label={t.tournamentQualifiedPerGroup} value={String(tournament.qualifiedPerGroup)} />
          <DetailRow icon="hourglass-outline" label={t.tournamentHalfDuration} value={`${tournament.halfDurationMinutes} min`} />
          <DetailRow icon="time-outline" label={t.tournamentHalfTime} value={`${tournament.halfTimeDurationMinutes} min`} />
          <DetailRow icon="timer-outline" label={t.tournamentGapBetweenMatches} value={`${tournament.gapBetweenMatchesMinutes} min`} />
        </View>

        <View style={styles.section}>
          <View style={[styles.boolRow, styles.boolRowFirst]}>
            <Text style={styles.boolLabel}>{t.tournamentSingleElimination}</Text>
            <Text style={[styles.boolValue, { color: tournament.isSingleElimination ? colors.green : colors.muted }]}>
              {tournament.isSingleElimination ? t.yes : t.no}
            </Text>
          </View>
          <View style={styles.boolRow}>
            <Text style={styles.boolLabel}>{t.tournamentThirdPlace}</Text>
            <Text style={[styles.boolValue, { color: tournament.hasThirdPlaceMatch ? colors.green : colors.muted }]}>
              {tournament.hasThirdPlaceMatch ? t.yes : t.no}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.tournamentTeams}</Text>
            <Text style={styles.sectionCount}>{teams.length}</Text>
          </View>
          {teams.length === 0
            ? <Text style={styles.noTeamsText}>{t.tournamentNoTeams}</Text>
            : teams.map((team) => (
              <View key={team.id} style={styles.teamRow}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>{team.name[0]?.toUpperCase() ?? "?"}</Text>
                </View>
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamMeta}>{team.memberUserIds.length} {t.tournamentMembers}</Text>
                </View>
              </View>
            ))
          }
        </View>

        {tournament.status === TournamentStatus.Draft && (
          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              tournament.isCurrentUserInTeam && styles.joinButtonDisabled,
              !tournament.isCurrentUserInTeam && pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push({ pathname: "/tournament/create-team", params: { tournamentId: id } })}
            disabled={tournament.isCurrentUserInTeam}
          >
            <Text style={[styles.joinButtonText, tournament.isCurrentUserInTeam && styles.joinButtonTextDisabled]}>
              {tournament.isCurrentUserInTeam ? t.createTeamAlreadyInTeam : t.joinTournament}
            </Text>
          </Pressable>
        )}

      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

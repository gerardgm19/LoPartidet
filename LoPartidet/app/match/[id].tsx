import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel, getStatusConfig } from "@/constants/match";
import { getMatchById, joinMatch, unjoinMatch, cancelMatch, deleteMatch, MatchDetail, MatchPlayer } from "@/services/matchesService";
import { useAuthStore } from "@/store/authStore";
import { MatchStatus } from "@/types/matchStatus";
import { DetailRow } from "@/components/DetailRow";
import { formatDate } from "@/utils/formatDate";
import { Toast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.black },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  location: { color: colors.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  datetime: { color: colors.muted, fontSize: 14, fontWeight: "500" },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  playersHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 20,
  },
  playersCountRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  playersCountBig: { color: colors.green, fontSize: 40, fontWeight: "800" },
  playersLabel: { color: colors.muted, fontSize: 16 },
  joinButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  joinButtonJoined: {
    backgroundColor: colors.red,
  },
  joinButtonText: { color: colors.black, fontSize: 16, fontWeight: "800" },
  joinButtonTextJoined: { color: colors.white },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 16,
  },
  sectionTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  sectionCount: { color: colors.muted, fontSize: 13 },
  playerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  playerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
  },
  playerAvatarMe: { backgroundColor: colors.green },
  playerAvatarOther: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  playerAvatarText: { color: colors.black, fontSize: 13, fontWeight: "800" },
  playerAvatarTextOther: { color: colors.muted },
  playerName: { color: colors.white, fontSize: 14, fontWeight: "600" },
  playerNickname: { color: colors.muted, fontSize: 12 },
  noPlayersText: { color: colors.muted, fontSize: 14, paddingVertical: 16, textAlign: "center" },
  manageSection: {
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 24,
    gap: 10,
  },
  manageLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  manageRow: { flexDirection: "row", gap: 12 },
  manageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  manageButtonDanger: { borderColor: colors.red },
  manageButtonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  manageButtonTextDanger: { color: colors.red },
}));

export default function MatchDetailPage() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.userId);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [match, setMatch] = useState<MatchDetail | undefined>();
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [unjoinModalVisible, setUnjoinModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [managing, setManaging] = useState(false);

  const handleJoin = async () => {
    if (joining || joined || !id) return;
    setJoining(true);
    try {
      await joinMatch(id);
      setJoined(true);
      setToastMessage(t.joinMatchSuccess);
      setToastVisible(true);
      const refreshed = await getMatchById(id);
      if (refreshed) setMatch(refreshed);
    } catch (error: any) {
      const msg: string = error.response?.data ?? "";
      if (msg.includes("already joined")) {
        setToastMessage(t.joinMatchAlreadyJoined);
      } else if (msg.includes("full")) {
        setToastMessage(t.joinMatchFull);
      } else {
        setToastMessage(t.joinMatchError);
      }
      setToastVisible(true);
    } finally {
      setJoining(false);
    }
  };

  const handleUnjoin = () => {
    if (!id) return;
    setUnjoinModalVisible(true);
  };

  const confirmUnjoin = async () => {
    setUnjoinModalVisible(false);
    setJoining(true);
    try {
      await unjoinMatch(id!);
      setJoined(false);
      setToastMessage(t.unjoinMatchSuccess);
      setToastVisible(true);
      const refreshed = await getMatchById(id!);
      if (refreshed) setMatch(refreshed);
    } catch {
      setToastMessage(t.unjoinMatchError);
      setToastVisible(true);
    } finally {
      setJoining(false);
    }
  };

  const confirmCancel = async () => {
    setCancelModalVisible(false);
    if (!id) return;
    setManaging(true);
    try {
      await cancelMatch(id);
      setToastMessage(t.cancelMatchSuccess);
      setToastVisible(true);
      const refreshed = await getMatchById(id);
      if (refreshed) setMatch(refreshed);
    } catch {
      setToastMessage(t.cancelMatchError);
      setToastVisible(true);
    } finally {
      setManaging(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteModalVisible(false);
    if (!id) return;
    setManaging(true);
    try {
      await deleteMatch(id);
      router.replace("/(tabs)/matches");
    } catch {
      setToastMessage(t.deleteMatchError);
      setToastVisible(true);
      setManaging(false);
    }
  };

  useEffect(() => {
    getMatchById(id)
      .then(setMatch)
      .catch(() => { setToastMessage(t.matchError); setToastVisible(true); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (match && userId) {
      setJoined(match.players.some((p) => p.id === parseInt(userId)));
    }
  }, [match, userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Pressable style={styles.backButton} onPress={() => router.replace("/(tabs)/matches")}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.matchNotFound}</Text>
        </View>
        <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
      </SafeAreaView>
    );
  }

  const { day, time } = formatDate(match.date);
  const sportTypeLabel = getSportTypeLabel(t);
  const statusCfg = getStatusConfig(t, colors)[match.status];
  const myId = userId ? parseInt(userId) : -1;
  const canManage = isAdmin() || match.createdById === myId;
  const canCancel = match.status !== MatchStatus.Cancelled && match.status !== MatchStatus.Finished;
  const canEdit = canManage && match.status === MatchStatus.Scheduled && new Date(match.date) > new Date();

  const renderPlayer = (player: MatchPlayer) => {
    const isMe = player.id === myId;
    const initials = (player.name[0] ?? "") + (player.surname[0] ?? "");
    const displayName = `${player.name} ${player.surname}`;
    return (
      <View key={player.id} style={styles.playerRow}>
        <View style={[styles.playerAvatar, isMe ? styles.playerAvatarMe : styles.playerAvatarOther]}>
          <Text style={[styles.playerAvatarText, !isMe && styles.playerAvatarTextOther]}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.playerName}>{displayName}</Text>
          {player.nickname ? <Text style={styles.playerNickname}>@{player.nickname}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.replace("/(tabs)/matches")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>{t.matchDetails}</Text>
        {canEdit ? (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            onPress={() => router.push(`/match/edit-match/${id}`)}
          >
            <Ionicons name="pencil" size={20} color={colors.white} />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{sportTypeLabel[match.type]}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              {match.status === MatchStatus.Live && <View style={styles.liveDot} />}
              <Text style={[styles.statusText, { color: statusCfg.fg }]}>{statusCfg.label}</Text>
            </View>
          </View>
          <Text style={styles.location}>{match.location}</Text>
          <Text style={styles.datetime}>{day}  ·  {time}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.playersHeader}>
            <View style={styles.playersCountRow}>
              <Text style={styles.playersCountBig}>{match.maxPlayers}</Text>
              <Text style={styles.playersLabel}>{t.players}</Text>
            </View>
            <Ionicons name="people-outline" size={28} color={colors.muted} />
          </View>
        </View>

        <View style={styles.section}>
          <DetailRow icon="location-sharp" label={t.location} value={match.location} accent />
          <DetailRow icon="calendar-outline" label={t.date} value={day} />
          <DetailRow icon="time-outline" label={t.time} value={time} />
          <DetailRow icon="hourglass-outline" label={t.duration} value={`${match.durationInMinutes} min`} />
          <DetailRow icon="football-outline" label={t.format} value={sportTypeLabel[match.type]} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.playersList}</Text>
            <Text style={styles.sectionCount}>{match.players.length} / {match.maxPlayers}</Text>
          </View>
          {match.players.length === 0
            ? <Text style={styles.noPlayersText}>{t.noPlayers}</Text>
            : match.players.map(renderPlayer)
          }
        </View>


        <Pressable
          style={({ pressed }) => [
            styles.joinButton,
            joined && styles.joinButtonJoined,
            pressed && { opacity: 0.8 },
          ]}
          onPress={joined ? handleUnjoin : handleJoin}
          disabled={joining}
        >
          {joining
            ? <ActivityIndicator color={joined ? colors.white : colors.black} size="small" />
            : <Text style={[styles.joinButtonText, joined && styles.joinButtonTextJoined]}>
              {joined ? t.unjoinMatch : t.joinMatch}
            </Text>
          }
        </Pressable>

        {canManage && (
          <View style={styles.manageSection}>
            <Text style={styles.manageLabel}>{t.matchManagement}</Text>
            <View style={styles.manageRow}>
              {canCancel && (
                <Pressable
                  style={({ pressed }) => [styles.manageButton, pressed && { opacity: 0.6 }]}
                  onPress={() => setCancelModalVisible(true)}
                  disabled={managing}
                >
                  <Ionicons name="close-circle-outline" size={18} color={colors.white} />
                  <Text style={styles.manageButtonText}>{t.cancelMatch}</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [styles.manageButton, styles.manageButtonDanger, pressed && { opacity: 0.6 }]}
                onPress={() => setDeleteModalVisible(true)}
                disabled={managing}
              >
                <Ionicons name="trash-outline" size={18} color={colors.red} />
                <Text style={[styles.manageButtonText, styles.manageButtonTextDanger]}>{t.deleteMatch}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />

      <ConfirmDialog
        visible={unjoinModalVisible}
        title={t.unjoinMatchConfirmTitle}
        message={t.unjoinMatchConfirmMessage}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={confirmUnjoin}
        onCancel={() => setUnjoinModalVisible(false)}
        destructive
      />

      <ConfirmDialog
        visible={cancelModalVisible}
        title={t.cancelMatchConfirmTitle}
        message={t.cancelMatchConfirmMessage}
        confirmLabel={t.cancelMatch}
        cancelLabel={t.cancel}
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalVisible(false)}
        destructive
      />

      <ConfirmDialog
        visible={deleteModalVisible}
        title={t.deleteMatchConfirmTitle}
        message={t.deleteMatchConfirmMessage}
        confirmLabel={t.deleteMatch}
        cancelLabel={t.cancel}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        destructive
      />
    </SafeAreaView>
  );
}

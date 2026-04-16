import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel, getStatusConfig } from "@/constants/match";
import { getMatchById, Match } from "@/services/matchesService";
import { MatchStatus } from "@/types/matchStatus";
import { DetailRow } from "@/components/DetailRow";
import { formatDate } from "@/utils/formatDate";
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
}));

export default function MatchDetail() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | undefined>();
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getMatchById(id)
      .then(setMatch)
      .catch(() => setToastVisible(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.matchNotFound}</Text>
        </View>
        <Toast message={t.matchError} visible={toastVisible} onHide={() => setToastVisible(false)} />
      </SafeAreaView>
    );
  }

  const { day, time } = formatDate(match.date);
  const sportTypeLabel = getSportTypeLabel(t);
  const statusCfg = getStatusConfig(t, colors)[match.status];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>{t.matchDetails}</Text>
        <View style={styles.navPlaceholder} />
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
          <DetailRow icon="location-sharp"       label={t.location}  value={match.location} accent />
          <DetailRow icon="calendar-outline"     label={t.date}      value={day} />
          <DetailRow icon="time-outline"         label={t.time}      value={time} />
          <DetailRow icon="football-outline"     label={t.format}    value={sportTypeLabel[match.type]} />
        </View>

      </ScrollView>

      <Toast message={t.matchError} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

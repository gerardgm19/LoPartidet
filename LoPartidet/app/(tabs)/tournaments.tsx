import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import MatchCardSkeleton from "@/components/MatchCardSkeleton";
import { Toast } from "@/components/Toast";
import { useLangStore } from "@/store/langStore";
import { getTournaments, Tournament } from "@/services/tournamentsService";
import { getSportTypeLabel } from "@/constants/match";
import { getTournamentStatusConfig } from "@/constants/tournament";
import { formatDateShort } from "@/utils/formatDate";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  refreshBtn: {
    padding: 6,
  },
  list: {
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  cardName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    letterSpacing: -0.3,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 8,
    columnGap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  chevron: {
    alignSelf: "center",
    paddingRight: 12,
    paddingLeft: 4,
  },
}));

export default function Tournaments() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const sportLabels = getSportTypeLabel(t);
  const statusConfig = getTournamentStatusConfig(t, colors);

  const fetchTournaments = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    getTournaments()
      .then(setTournaments)
      .catch(() => setToastVisible(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    if (Platform.OS === "web") {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ).start();
    }
    fetchTournaments(true);
  }, [fetchTournaments, refreshing, spinAnim]);

  useEffect(() => {
    if (!refreshing && Platform.OS === "web") {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [refreshing, spinAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.tournaments}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {Platform.OS === "web" && (
            <Pressable style={styles.refreshBtn} onPress={handleRefresh} accessibilityLabel={t.refresh}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="refresh" size={22} color={colors.white} />
              </Animated.View>
            </Pressable>
          )}
        </View>
      </View>

      {loading || refreshing ? (
        <View>
          {Array.from({ length: 5 }).map((_, i) => <MatchCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const status = statusConfig[item.status];
            const date = formatDateShort(item.startDate);
            return (
              <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]} onPress={() => router.push(`/tournament/${item.id}`)}>
                <View style={[styles.accentBar, { backgroundColor: status.fg }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                    </View>
                  </View>
                  <View style={styles.metaGrid}>
                    <View style={styles.metaRow}>
                      <Ionicons name="football-outline" size={14} color={colors.muted} />
                      <Text style={styles.metaText}>{sportLabels[item.sportType]}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                      <Text style={styles.metaText}>{date.day} · {date.time}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="people-outline" size={14} color={colors.muted} />
                      <Text style={styles.metaText}>{item.groupsCount} × {item.teamsPerGroup}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons style={styles.chevron} name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            );
          }}
          contentContainerStyle={tournaments.length === 0 ? { flexGrow: 1 } : styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={Platform.OS !== "web" ? handleRefresh : undefined}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyText}>{t.noTournamentsTitle}</Text>
              <Text style={styles.emptySubtext}>{t.noTournamentsSubtitle}</Text>
            </View>
          }
        />
      )}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push("/tournament/create-tournament")}
        accessibilityLabel={t.createTournamentBtn}
      >
        <Ionicons name="add" size={28} color={colors.black} />
      </Pressable>
      <Toast
        message={t.tournamentsError}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

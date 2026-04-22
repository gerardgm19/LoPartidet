import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getMatches } from "@/services/matchesService";
import { Match } from "@/services/matchesService";
import MatchCard from "@/components/MatchCard";
import MatchCardSkeleton from "@/components/MatchCardSkeleton";
import { Toast } from "@/components/Toast";
import { useLangStore } from "@/store/langStore";
import { MatchStatus } from "@/types/matchStatus";

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
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.green,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.black,
  },
  livePillText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  list: {
    paddingBottom: 16,
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
}));

export default function Matches() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const fetchMatches = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    getMatches()
      .then(setMatches)
      .catch(() => setToastVisible(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    if (Platform.OS === "web") {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ).start();
    }
    fetchMatches(true);
  }, [fetchMatches, refreshing, spinAnim]);

  useEffect(() => {
    if (!refreshing && Platform.OS === "web") {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [refreshing, spinAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const liveCount = matches.filter((m) => m.status === MatchStatus.Live).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.matches}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {liveCount > 0 && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.livePillText}>{liveCount} {t.live}</Text>
            </View>
          )}
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
      ) : matches.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyText}>{t.noMatchesTitle}</Text>
          <Text style={styles.emptySubtext}>{t.noMatchesSubtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} onPress={() => router.push(`/match/${item.id}`)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={Platform.OS !== "web" ? handleRefresh : undefined}
        />
      )}
      <Toast
        message={t.matchesError}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

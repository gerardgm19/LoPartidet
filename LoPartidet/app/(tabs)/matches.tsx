import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getMatches } from "@/services/matchesService";
import { Match } from "@/services/matchesService";
import MatchCard from "@/components/MatchCard";
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
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch(() => setToastVisible(true))
      .finally(() => setLoading(false));
  }, []);

  const liveCount = matches.filter((m) => m.status === MatchStatus.Live).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.matches}</Text>
        {liveCount > 0 && (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>{liveCount} {t.live}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
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

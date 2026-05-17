import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getMatches, Match } from "@/services/matchesService";
import MatchCard from "@/components/MatchCard";
import MatchCardSkeleton from "@/components/MatchCardSkeleton";
import { Toast } from "@/components/Toast";
import { useLangStore } from "@/store/langStore";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: "center", alignItems: "center",
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  navPlaceholder: { width: 38 },
  list: { paddingBottom: 16 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: colors.white, fontSize: 18, fontWeight: "700" },
  emptySubtext: { color: colors.muted, fontSize: 14 },
}));

export default function UserMatches() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const fetchMatches = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    getMatches({ joined: true })
      .then(setMatches)
      .catch(() => setToastVisible(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navbar}>
          <Pressable style={styles.backButton} onPress={() => router.replace("/(tabs)/profile")}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>{t.myMatches}</Text>
          <View style={styles.navPlaceholder} />
        </View>

        {loading || refreshing ? (
          <View>
            {Array.from({ length: 5 }).map((_, i) => <MatchCardSkeleton key={i} />)}
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MatchCard match={item} onPress={() => router.push(`/match/${item.id}`)} />}
            contentContainerStyle={matches.length === 0 ? { flexGrow: 1 } : styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            onRefresh={() => fetchMatches(true)}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyIcon}>⚽</Text>
                <Text style={styles.emptyText}>{t.noJoinedMatchesTitle}</Text>
                <Text style={styles.emptySubtext}>{t.noJoinedMatchesSubtitle}</Text>
              </View>
            }
          />
        )}

        <Toast
          message={t.myMatchesError}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}

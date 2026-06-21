import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import MatchCardSkeleton from "@/components/MatchCardSkeleton";
import { Toast } from "@/components/Toast";
import { useLangStore } from "@/store/langStore";

type Tournament = { id: string };

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

export default function Tournaments() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const fetchTournaments = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    Promise.resolve<Tournament[]>([])
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
          keyExtractor={(item) => item.id}
          renderItem={() => null}
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
      <Toast
        message={t.tournamentsError}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

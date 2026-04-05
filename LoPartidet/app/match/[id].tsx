import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getMatchById, Match } from "@/services/matchesService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FOOTBALL_TYPE_LABEL: Record<Match["footballType"], string> = {
  fut5:   "Fut 5",
  fut7:   "Fut 7",
  fut11:  "Fut 11",
  futsal: "Futsal",
  beach:  "Beach",
  indoor: "Indoor",
};

const STATUS_CONFIG: Record<
  Match["status"],
  { label: string; bg: string; fg: string }
> = {
  live:      { label: "Live",      bg: Colors.green,  fg: Colors.black },
  scheduled: { label: "Scheduled", bg: Colors.border, fg: Colors.muted },
  finished:  { label: "Finished",  bg: Colors.border, fg: Colors.muted },
};

function formatDate(iso: string): { day: string; time: string; full: string } {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time, full: `${day} at ${time}` };
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={detailRowStyles.row}>
      <View style={detailRowStyles.iconBox}>
        <Ionicons name={icon} size={18} color={accent ? Colors.green : Colors.muted} />
      </View>
      <View style={detailRowStyles.content}>
        <Text style={detailRowStyles.label}>{label}</Text>
        <Text style={[detailRowStyles.value, accent && detailRowStyles.valueAccent]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  valueAccent: {
    color: Colors.green,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatchById(id)
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Match not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { day, time } = formatDate(match.date);
  const statusCfg = STATUS_CONFIG[match.status];
  const spotsLeft = match.maxPeople - match.joinedCount;
  const fillRatio = match.joinedCount / match.maxPeople;
  const isFull = spotsLeft === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* ── Navigation bar ── */}
      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>Match details</Text>
        {/* Right placeholder to keep title centred */}
        <View style={styles.navPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{FOOTBALL_TYPE_LABEL[match.footballType]}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              {match.status === "live" && <View style={styles.liveDot} />}
              <Text style={[styles.statusText, { color: statusCfg.fg }]}>{statusCfg.label}</Text>
            </View>
          </View>

          <Text style={styles.location}>{match.location}</Text>
          <Text style={styles.datetime}>{day}  ·  {time}</Text>
        </View>

        {/* ── People card ── */}
        <View style={styles.section}>
          <View style={styles.peopleHeader}>
            <View style={styles.peopleCountRow}>
              <Text style={styles.peopleCountBig}>{match.joinedCount}</Text>
              <Text style={styles.peopleMax}>/ {match.maxPeople}</Text>
              <Text style={styles.peopleLabel}>players</Text>
            </View>
            {isFull
              ? <View style={styles.fullPill}><Text style={styles.fullPillText}>Full</Text></View>
              : <Text style={styles.spotsLeftText}>{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</Text>
            }
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(fillRatio * 100, 100)}%` as any },
                isFull && styles.barFull,
              ]}
            />
          </View>
        </View>

        {/* ── Info rows ── */}
        <View style={styles.section}>
          <DetailRow icon="location-sharp"      label="Location"    value={match.location} accent />
          <DetailRow icon="calendar-outline"    label="Date"        value={day} />
          <DetailRow icon="time-outline"        label="Time"        value={time} />
          <DetailRow icon="person-circle-outline" label="Organizer" value={match.organizer} />
          <DetailRow icon="football-outline"    label="Format"      value={FOOTBALL_TYPE_LABEL[match.footballType]} />
        </View>

        {/* ── Joined status ── */}
        <View style={[styles.joinedCard, match.isJoined && styles.joinedCardActive]}>
          <Ionicons
            name={match.isJoined ? "checkmark-circle" : "ellipse-outline"}
            size={22}
            color={match.isJoined ? Colors.black : Colors.muted}
          />
          <Text style={[styles.joinedCardText, match.isJoined && styles.joinedCardTextActive]}>
            {match.isJoined ? "You are joining this match" : "You have not joined this match"}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.muted,
    fontSize: 16,
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  navPlaceholder: {
    width: 38,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // Hero
  hero: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.black,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  location: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  datetime: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "500",
  },

  // Section
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // People
  peopleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  peopleCountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  peopleCountBig: {
    color: Colors.green,
    fontSize: 32,
    fontWeight: "800",
  },
  peopleMax: {
    color: Colors.muted,
    fontSize: 18,
    fontWeight: "600",
  },
  peopleLabel: {
    color: Colors.muted,
    fontSize: 14,
    marginLeft: 4,
  },
  spotsLeftText: {
    color: Colors.muted,
    fontSize: 13,
  },
  fullPill: {
    backgroundColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  fullPillText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  barFull: {
    backgroundColor: Colors.muted,
  },

  // Joined card
  joinedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  joinedCardActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  joinedCardText: {
    color: Colors.muted,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  joinedCardTextActive: {
    color: Colors.black,
  },
});

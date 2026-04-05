import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Match } from "@/services/matchesService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): { day: string; time: string } {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time };
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = { match: Match; onPress: () => void };

export default function MatchCard({ match, onPress }: Props) {
  const { day, time } = formatDate(match.date);
  const statusCfg = STATUS_CONFIG[match.status];
  const spotsLeft = match.maxPeople - match.joinedCount;
  const fillRatio = match.joinedCount / match.maxPeople;
  const isFull = spotsLeft === 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, match.isJoined && styles.cardJoined, pressed && styles.cardPressed]}
      onPress={onPress}
    >

      {/* ── Row 1: Location (primary) ── */}
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color={Colors.green} />
        <Text style={styles.locationText} numberOfLines={1}>{match.location}</Text>
      </View>

      {/* ── Row 2: Date & time (primary) ── */}
      <View style={styles.dateRow}>
        <View style={styles.dateBlock}>
          <Ionicons name="calendar-outline" size={14} color={Colors.white} />
          <Text style={styles.dateText}>{day}</Text>
        </View>
        <View style={styles.dateSep} />
        <View style={styles.dateBlock}>
          <Ionicons name="time-outline" size={14} color={Colors.white} />
          <Text style={styles.dateText}>{time}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Row 3: Spots (primary) ── */}
      <View style={styles.spotsRow}>
        <View style={styles.spotsLeft}>
          <Ionicons name="people-outline" size={15} color={Colors.muted} />
          <Text style={styles.spotsCount}>
            <Text style={styles.spotsJoined}>{match.joinedCount}</Text>
            <Text style={styles.spotsMuted}>/{match.maxPeople}</Text>
          </Text>
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

      <View style={styles.divider} />

      {/* ── Row 4: Secondary info ── */}
      <View style={styles.secondaryRow}>
        {/* Left: type badge + organizer */}
        <View style={styles.secondaryLeft}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{FOOTBALL_TYPE_LABEL[match.footballType]}</Text>
          </View>
          <View style={styles.organizerItem}>
            <Ionicons name="person-outline" size={12} color={Colors.muted} />
            <Text style={styles.organizerText} numberOfLines={1}>{match.organizer}</Text>
          </View>
        </View>

        {/* Right: status + joined */}
        <View style={styles.secondaryRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            {match.status === "live" && <View style={styles.liveDot} />}
            <Text style={[styles.statusText, { color: statusCfg.fg }]}>{statusCfg.label}</Text>
          </View>
          <View style={[styles.joinedBadge, match.isJoined && styles.joinedBadgeActive]}>
            <Ionicons
              name={match.isJoined ? "checkmark-circle" : "ellipse-outline"}
              size={12}
              color={match.isJoined ? Colors.black : Colors.muted}
            />
            <Text style={[styles.joinedText, match.isJoined && styles.joinedTextActive]}>
              {match.isJoined ? "Joined" : "Not joined"}
            </Text>
          </View>
        </View>
      </View>

    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardJoined: {
    borderColor: Colors.greenDim,
  },
  cardPressed: {
    opacity: 0.7,
  },

  // Location
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },

  // Date & time
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  dateSep: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Spots
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  spotsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spotsCount: {
    fontSize: 14,
  },
  spotsJoined: {
    color: Colors.white,
    fontWeight: "700",
  },
  spotsMuted: {
    color: Colors.muted,
  },
  spotsLeftText: {
    color: Colors.muted,
    fontSize: 12,
  },
  fullPill: {
    backgroundColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fullPillText: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
  barFull: {
    backgroundColor: Colors.muted,
  },

  // Secondary row
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  organizerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  organizerText: {
    color: Colors.muted,
    fontSize: 12,
  },
  secondaryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.black,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  joinedBadgeActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  joinedText: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  joinedTextActive: {
    color: Colors.black,
  },
});

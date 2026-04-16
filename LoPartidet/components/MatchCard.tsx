import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getSportTypeLabel, getStatusConfig } from "@/constants/match";
import { Match } from "@/services/matchesService";
import { MatchStatus } from "@/types/matchStatus";
import { useLangStore } from "@/store/langStore";
import { formatDateShort } from "@/utils/formatDate";

type Props = { match: Match; onPress: () => void };

export default function MatchCard({ match, onPress }: Props) {
  const t = useLangStore((s) => s.t);
  const { day, time } = formatDateShort(match.date);
  const statusCfg = getStatusConfig(t)[match.status];
  const sportLabel = getSportTypeLabel(t)[match.type];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* ── Row 1: Location ── */}
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color={Colors.green} />
        <Text style={styles.locationText} numberOfLines={1}>{match.location}</Text>
      </View>

      {/* ── Row 2: Date & time ── */}
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

      {/* ── Row 3: Secondary info ── */}
      <View style={styles.secondaryRow}>
        <View style={styles.secondaryLeft}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{sportLabel}</Text>
          </View>
          <View style={styles.playersRow}>
            <Ionicons name="people-outline" size={12} color={Colors.muted} />
            <Text style={styles.playersText}>{match.maxPlayers} {t.players}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          {match.status === MatchStatus.Live && <View style={styles.liveDot} />}
          <Text style={[styles.statusText, { color: statusCfg.fg }]}>{statusCfg.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

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
  cardPressed: { opacity: 0.7 },

  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { color: Colors.white, fontSize: 16, fontWeight: "700", flexShrink: 1 },

  dateRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateBlock: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  dateSep: { width: 1, height: 14, backgroundColor: Colors.border },

  divider: { height: 1, backgroundColor: Colors.border },

  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: { color: Colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  playersRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  playersText: { color: Colors.muted, fontSize: 12 },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.black },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
});

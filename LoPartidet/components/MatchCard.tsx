import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel, getStatusConfig } from "@/constants/match";
import { Match } from "@/services/matchesService";
import { MatchStatus } from "@/types/matchStatus";
import { useLangStore } from "@/store/langStore";
import { formatDateShort } from "@/utils/formatDate";

type Props = { match: Match; onPress: () => void };

const useStyles = makeStyles((colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardPressed: { opacity: 0.7 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { color: colors.white, fontSize: 16, fontWeight: "700", flexShrink: 1 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateBlock: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  dateSep: { width: 1, height: 14, backgroundColor: colors.border },
  divider: { height: 1, backgroundColor: colors.border },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeText: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  playersRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  playersText: { color: colors.muted, fontSize: 12 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.black },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
}));

export default function MatchCard({ match, onPress }: Props) {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { day, time } = formatDateShort(match.date);
  const statusCfg = getStatusConfig(t, colors)[match.status];
  const sportLabel = getSportTypeLabel(t)[match.type];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color={colors.green} />
        <Text style={styles.locationText} numberOfLines={1}>{match.location}</Text>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateBlock}>
          <Ionicons name="calendar-outline" size={14} color={colors.white} />
          <Text style={styles.dateText}>{day}</Text>
        </View>
        <View style={styles.dateSep} />
        <View style={styles.dateBlock}>
          <Ionicons name="time-outline" size={14} color={colors.white} />
          <Text style={styles.dateText}>{time}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.secondaryRow}>
        <View style={styles.secondaryLeft}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{sportLabel}</Text>
          </View>
          <View style={styles.playersRow}>
            <Ionicons name="people-outline" size={12} color={colors.muted} />
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

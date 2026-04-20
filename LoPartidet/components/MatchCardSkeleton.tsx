import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

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
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  line: { height: 14, borderRadius: 7 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateBlock: { flexDirection: "row", alignItems: "center", gap: 5 },
  divider: { height: 1, backgroundColor: colors.border },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { height: 22, borderRadius: 6 },
}));

function Bone({ width, style }: { width: number | string; style?: object }) {
  const colors = useThemeStore((s) => s.colors);
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, backgroundColor: colors.muted, opacity }, style]}
    />
  );
}

export default function MatchCardSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <View style={styles.locationRow}>
        <Bone width={16} style={styles.dot} />
        <Bone width="60%" style={styles.line} />
      </View>

      <View style={styles.dateRow}>
        <Bone width={80} style={styles.line} />
        <Bone width={1} style={{ height: 14 }} />
        <Bone width={60} style={styles.line} />
      </View>

      <View style={styles.divider} />

      <View style={styles.secondaryRow}>
        <View style={styles.secondaryLeft}>
          <Bone width={52} style={styles.badge} />
          <Bone width={70} style={styles.line} />
        </View>
        <Bone width={60} style={styles.badge} />
      </View>
    </View>
  );
}

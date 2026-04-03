import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>?</Text>
      </View>
      <Text style={styles.name}>Guest User</Text>
      <Text style={styles.sub}>No account yet</Text>
      <View style={styles.divider} />
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    alignSelf: "flex-start",
    color: Colors.white,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 36,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.green,
    fontSize: 36,
    fontWeight: "700",
  },
  name: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  sub: {
    color: Colors.muted,
    fontSize: 14,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: Colors.green,
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statSep: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
});

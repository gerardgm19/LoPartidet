import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

const useStyles = makeStyles((colors) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  valueAccent: {
    color: colors.green,
  },
}));

export function DetailRow({
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
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={18} color={accent ? colors.green : colors.muted} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, accent && styles.valueAccent]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

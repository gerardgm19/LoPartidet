import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { useLangStore } from "@/store/langStore";

type Position = "GK" | "DEF" | "MID" | "WIN" | "FWD";
type Foot = "Left" | "Right" | "Both";
type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
type Speed = "Slow" | "Medium" | "Fast" | "Elite";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "GK", label: "GK" },
  { value: "DEF", label: "DEF" },
  { value: "MID", label: "MID" },
  { value: "WIN", label: "WIN" },
  { value: "FWD", label: "FWD" },
];

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { color: colors.white, fontSize: 18, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.green, borderRadius: 20 },
  saveBtnText: { color: colors.black, fontSize: 14, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 24 },
  section: { gap: 10 },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.green, borderColor: colors.green },
  pillText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  pillTextActive: { color: colors.black },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 16,
  },
}));

export default function PlayerDetails() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();

  const [position, setPosition] = useState<Position | null>(null);
  const [foot, setFoot] = useState<Foot | null>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [height, setHeight] = useState("");

  const FEET: { value: Foot; label: string }[] = [
    { value: "Left", label: t.footLeft },
    { value: "Right", label: t.footRight },
    { value: "Both", label: t.footBoth },
  ];

  const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
    { value: "Beginner", label: t.skillBeginner },
    { value: "Intermediate", label: t.skillIntermediate },
    { value: "Advanced", label: t.skillAdvanced },
    { value: "Expert", label: t.skillExpert },
  ];

  const SPEEDS: { value: Speed; label: string }[] = [
    { value: "Slow", label: t.speedSlow },
    { value: "Medium", label: t.speedMedium },
    { value: "Fast", label: t.speedFast },
    { value: "Elite", label: t.speedElite },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.playerDetailsTitle}</Text>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.position}</Text>
            <View style={styles.pills}>
              {POSITIONS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.pill, position === p.value && styles.pillActive]}
                  onPress={() => setPosition(p.value)}
                >
                  <Text style={[styles.pillText, position === p.value && styles.pillTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.preferredFoot}</Text>
            <View style={styles.pills}>
              {FEET.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.pill, foot === f.value && styles.pillActive]}
                  onPress={() => setFoot(f.value)}
                >
                  <Text style={[styles.pillText, foot === f.value && styles.pillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.skillLevel}</Text>
            <View style={styles.pills}>
              {SKILL_LEVELS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.pill, skillLevel === s.value && styles.pillActive]}
                  onPress={() => setSkillLevel(s.value)}
                >
                  <Text style={[styles.pillText, skillLevel === s.value && styles.pillTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.speed}</Text>
            <View style={styles.pills}>
              {SPEEDS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.pill, speed === s.value && styles.pillActive]}
                  onPress={() => setSpeed(s.value)}
                >
                  <Text style={[styles.pillText, speed === s.value && styles.pillTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.jerseyNumber}</Text>
            <TextInput
              style={styles.input}
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
              placeholder={t.jerseyPlaceholder}
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.height}</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder={t.heightPlaceholder}
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

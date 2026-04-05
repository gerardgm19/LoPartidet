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
import { Colors } from "@/constants/colors";

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

const FEET: Foot[] = ["Left", "Right", "Both"];
const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SPEEDS: Speed[] = ["Slow", "Medium", "Fast", "Elite"];

export default function PlayerDetails() {
  const [position, setPosition] = useState<Position | null>(null);
  const [foot, setFoot] = useState<Foot | null>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [height, setHeight] = useState("");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Player details</Text>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Section label="Position">
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
          </Section>

          <Section label="Preferred foot">
            <View style={styles.pills}>
              {FEET.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.pill, foot === f && styles.pillActive]}
                  onPress={() => setFoot(f)}
                >
                  <Text style={[styles.pillText, foot === f && styles.pillTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section label="Skill level">
            <View style={styles.pills}>
              {SKILL_LEVELS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, skillLevel === s && styles.pillActive]}
                  onPress={() => setSkillLevel(s)}
                >
                  <Text style={[styles.pillText, skillLevel === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section label="Speed">
            <View style={styles.pills}>
              {SPEEDS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, speed === s && styles.pillActive]}
                  onPress={() => setSpeed(s)}
                >
                  <Text style={[styles.pillText, speed === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section label="Jersey number">
            <TextInput
              style={styles.input}
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
              placeholder="e.g. 10"
              placeholderTextColor={Colors.muted}
              keyboardType="number-pad"
              maxLength={2}
            />
          </Section>

          <Section label="Height (cm)">
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="e.g. 178"
              placeholderTextColor={Colors.muted}
              keyboardType="number-pad"
              maxLength={3}
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.green,
    borderRadius: 20,
  },
  saveBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  pillText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: Colors.black,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 16,
  },
});

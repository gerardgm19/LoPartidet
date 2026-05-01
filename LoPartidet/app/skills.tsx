import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { useAuthStore } from "@/store/authStore";
import { Position } from "@/types/position";
import { PreferredFoot } from "@/types/preferredFoot";
import { SkillLevel } from "@/types/skillLevel";
import { PlayerSpeed } from "@/types/playerSpeed";
import {
  createPlayerSkill,
  getPlayerSkillsByUser,
  updatePlayerSkill,
} from "@/services/playerSkillsService";
import { Toast } from "@/components/Toast";

const POSITIONS: { value: Position; label: string }[] = [
  { value: Position.GK, label: "GK" },
  { value: Position.DEF, label: "DEF" },
  { value: Position.MID, label: "MID" },
  { value: Position.WIN, label: "WIN" },
  { value: Position.FWD, label: "FWD" },
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
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.black,
  },
  saveBtn: { paddingVertical: 14, backgroundColor: colors.green, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: colors.black, fontSize: 16, fontWeight: "700" },
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

export default function Skills() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const userId = useAuthStore((s) => s.userId);

  const [skillId, setSkillId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
  }
  const [position, setPosition] = useState<Position | null>(null);
  const [foot, setFoot] = useState<PreferredFoot | null>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [speed, setSpeed] = useState<PlayerSpeed | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    if (!userId) return;
    getPlayerSkillsByUser(userId).then((skills) => {
      const skill = skills[0];
      if (!skill) return;
      setSkillId(skill.id);
      if (skill.position !== null) setPosition(skill.position);
      if (skill.preferredFoot !== null) setFoot(skill.preferredFoot);
      if (skill.skillLevel !== null) setSkillLevel(skill.skillLevel);
      if (skill.speed !== null) setSpeed(skill.speed);
      if (skill.jerseyNumber !== null) setJerseyNumber(String(skill.jerseyNumber));
      if (skill.height !== null) setHeight(String(skill.height));
    });
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    const skillData = {
      position,
      preferredFoot: foot,
      skillLevel,
      speed,
      jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
      height: height ? parseInt(height, 10) : null,
    };
    try {
      if (skillId) {
        await updatePlayerSkill(skillId, skillData);
      } else {
        await createPlayerSkill({ userId: parseInt(userId, 10), ...skillData });
      }
      showToast(t.playerInformationSaved);
      setTimeout(() => router.back(), 1200);
    } catch {
      showToast(t.playerInformationError);
    }
  };

  const FEET: { value: PreferredFoot; label: string }[] = [
    { value: PreferredFoot.Left, label: t.footLeft },
    { value: PreferredFoot.Right, label: t.footRight },
    { value: PreferredFoot.Both, label: t.footBoth },
  ];

  const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
    { value: SkillLevel.Beginner, label: t.skillBeginner },
    { value: SkillLevel.Intermediate, label: t.skillIntermediate },
    { value: SkillLevel.Advanced, label: t.skillAdvanced },
    { value: SkillLevel.Expert, label: t.skillExpert },
  ];

  const SPEEDS: { value: PlayerSpeed; label: string }[] = [
    { value: PlayerSpeed.Slow, label: t.speedSlow },
    { value: PlayerSpeed.Medium, label: t.speedMedium },
    { value: PlayerSpeed.Fast, label: t.speedFast },
    { value: PlayerSpeed.Elite, label: t.speedElite },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.skillsTitle}</Text>
          <View style={styles.backBtn} />
        </View>

        <KeyboardAvoidingView
          style={styles.scroll}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
        </KeyboardAvoidingView>

        <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </>
  );
}

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel } from "@/constants/match";
import { createTournament } from "@/services/tournamentsService";
import { SportType } from "@/types/sportType";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/components/Toast";
import BirthdayPicker from "@/components/BirthdayPicker";
import TimePicker from "@/components/TimePicker";
import DurationPicker from "@/components/DurationPicker";

const SPORT_TYPES = [
  SportType.Fut5,
  SportType.Fut7,
  SportType.Fut11,
  SportType.Futsal,
  SportType.Beach,
  SportType.Indoor,
];

const HALF_DURATION_OPTIONS = [15, 20, 25, 30, 35, 40, 45];
const HALF_TIME_OPTIONS = [5, 10, 15, 20];
const GAP_OPTIONS = [5, 10, 15, 20, 30];

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: "center", alignItems: "center",
  },
  navTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  navPlaceholder: { width: 38 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  section: { gap: 10 },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typePill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillActive: { backgroundColor: colors.green, borderColor: colors.green },
  typePillText: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  typePillTextActive: { color: colors.black },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 15,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  stepBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  stepBtnText: { color: colors.white, fontSize: 22, fontWeight: "300" },
  stepValue: {
    minWidth: 56,
    textAlign: "center",
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleLabel: { color: colors.white, fontSize: 15, fontWeight: "600" },
  row2: { flexDirection: "row", gap: 12 },
  createBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: { color: colors.black, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
}));

export default function CreateTournament() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const userId = useAuthStore((s) => s.userId);
  const sportTypeLabel = getSportTypeLabel(t);

  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<SportType>(SportType.Fut7);
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [groupsCount, setGroupsCount] = useState(2);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState(2);
  const [isSingleElimination, setIsSingleElimination] = useState(true);
  const [hasThirdPlaceMatch, setHasThirdPlaceMatch] = useState(false);
  const [halfDurationMinutes, setHalfDurationMinutes] = useState(30);
  const [halfTimeDurationMinutes, setHalfTimeDurationMinutes] = useState(10);
  const [gapBetweenMatchesMinutes, setGapBetweenMatchesMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [nameError, setNameError] = useState(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
  }

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  async function handleCreate() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (!userId) return;

    setLoading(true);
    try {
      const tournament = await createTournament({
        name: name.trim(),
        sportType: selectedType,
        createdBy: userId,
        startDate: datetime.toISOString(),
        groupsCount,
        teamsPerGroup,
        qualifiedPerGroup,
        isSingleElimination,
        hasThirdPlaceMatch,
        halfDurationMinutes,
        halfTimeDurationMinutes,
        gapBetweenMatchesMinutes,
      });
      showToast(t.tournamentCreated);
      setTimeout(() => router.replace(`/(tabs)/tournaments`), 1200);
    } catch {
      showToast(t.createTournamentError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.navbar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.navTitle}>{t.createTournamentTitle}</Text>
        <View style={styles.navPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>{t.tournamentName}</Text>
            <TextInput
              style={[styles.input, nameError && { borderColor: colors.red }]}
              placeholder={t.tournamentNamePlaceholder}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(v) => { setName(v); if (nameError) setNameError(false); }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.sportType}</Text>
            <View style={styles.typeGrid}>
              {SPORT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.typePill, selectedType === type && styles.typePillActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.typePillText, selectedType === type && styles.typePillTextActive]}>
                    {sportTypeLabel[type]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.date}</Text>
            <BirthdayPicker
              label={t.date}
              compact
              yearOptions={Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i)}
              value={`${datetime.getFullYear()}-${String(datetime.getMonth() + 1).padStart(2, "0")}-${String(datetime.getDate()).padStart(2, "0")}`}
              onChange={(iso) => {
                if (!iso) return;
                const [y, m, d] = iso.split("-").map(Number);
                const next = new Date(datetime);
                next.setFullYear(y, m - 1, d);
                setDatetime(next);
              }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.time}</Text>
            <TimePicker
              label={t.time}
              value={`${String(datetime.getHours()).padStart(2, "0")}:${String(datetime.getMinutes()).padStart(2, "0")}`}
              minuteInterval={15}
              onChange={(hhmm) => {
                if (!hhmm) return;
                const [h, m] = hhmm.split(":").map(Number);
                const next = new Date(datetime);
                next.setHours(h, m, 0, 0);
                setDatetime(next);
              }}
            />
          </View>

          <View style={styles.row2}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>{t.groups}</Text>
              <View style={styles.stepper}>
                <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setGroupsCount((v) => clamp(v - 1, 1, 16))}>
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepValue}>{groupsCount}</Text>
                <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setGroupsCount((v) => clamp(v + 1, 1, 16))}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>{t.teamsPerGroup}</Text>
              <View style={styles.stepper}>
                <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setTeamsPerGroup((v) => clamp(v - 1, 2, 16))}>
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepValue}>{teamsPerGroup}</Text>
                <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setTeamsPerGroup((v) => clamp(v + 1, 2, 16))}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.qualifiedPerGroup}</Text>
            <View style={styles.stepper}>
              <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setQualifiedPerGroup((v) => clamp(v - 1, 1, teamsPerGroup - 1))}>
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepValue}>{qualifiedPerGroup}</Text>
              <Pressable style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]} onPress={() => setQualifiedPerGroup((v) => clamp(v + 1, 1, teamsPerGroup - 1))}>
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.halfDuration}</Text>
            <DurationPicker
              label={t.halfDuration}
              value={halfDurationMinutes}
              options={HALF_DURATION_OPTIONS}
              onChange={setHalfDurationMinutes}
            />
          </View>

          <View style={styles.row2}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>{t.halfTimeDuration}</Text>
              <DurationPicker
                label={t.halfTimeDuration}
                value={halfTimeDurationMinutes}
                options={HALF_TIME_OPTIONS}
                onChange={setHalfTimeDurationMinutes}
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>{t.gapBetweenMatches}</Text>
              <DurationPicker
                label={t.gapBetweenMatches}
                value={gapBetweenMatchesMinutes}
                options={GAP_OPTIONS}
                onChange={setGapBetweenMatchesMinutes}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t.singleElimination}</Text>
              <Switch
                value={isSingleElimination}
                onValueChange={setIsSingleElimination}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t.thirdPlaceMatch}</Text>
              <Switch
                value={hasThirdPlaceMatch}
                onValueChange={setHasThirdPlaceMatch}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.black} />
              : <Text style={styles.createBtnText}>{t.createTournamentBtn}</Text>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { createMatch } from "@/services/matchesService";
import { SportType } from "@/types/sportType";
import { useLangStore } from "@/store/langStore";
import { Toast } from "@/components/Toast";
import TimePicker from "@/components/TimePicker";
import BirthdayPicker from "@/components/BirthdayPicker";
import DurationPicker from "@/components/DurationPicker";

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 105, 120];

const SPORT_TYPES = [
  SportType.Fut5,
  SportType.Fut7,
  SportType.Fut11,
  SportType.Futsal,
  SportType.Beach,
  SportType.Indoor,
];

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
  dateTimeRow: { flexDirection: "row", gap: 12 },
  dateTimeField: { flex: 1, gap: 10 },
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
    gap: 0,
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
  createBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: { color: colors.black, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
}));

export default function Create() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const sportTypeLabel = getSportTypeLabel(t);

  const [selectedType, setSelectedType] = useState<SportType>(SportType.Fut7);
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [durationInMinutes, setDurationInMinutes] = useState(90);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
  }

  function adjustPlayers(delta: number) {
    setMaxPlayers((v) => Math.max(2, Math.min(30, v + delta)));
  }

  async function handleCreate() {
    if (!location.trim()) return;

    setLoading(true);
    try {
      const match = await createMatch({ type: selectedType, date: datetime.toISOString(), location: location.trim(), maxPlayers, durationInMinutes });
      showToast(t.matchCreated);
      setTimeout(() => router.replace(`/match/${match.id}`), 1200);
    } catch {
      showToast(t.createMatchError);
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
        <Text style={styles.navTitle}>{t.createMatchTitle}</Text>
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

        <View style={styles.dateTimeRow}>
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
          <View style={styles.section}>
            <Text style={styles.label}>{t.duration}</Text>
            <DurationPicker
              label={t.duration}
              value={durationInMinutes}
              options={DURATION_OPTIONS}
              onChange={setDurationInMinutes}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.location}</Text>
          <TextInput
            style={styles.input}
            placeholder="Camp Nou, Barcelona"
            placeholderTextColor={colors.muted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.maxPlayers}</Text>
          <View style={styles.stepper}>
            <Pressable
              style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
              onPress={() => adjustPlayers(-1)}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{maxPlayers}</Text>
            <Pressable
              style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
              onPress={() => adjustPlayers(1)}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.black} />
            : <Text style={styles.createBtnText}>{t.createMatchBtn}</Text>
          }
        </Pressable>
      </ScrollView>

      </KeyboardAvoidingView>
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

import { useState } from "react";
import {
  ActivityIndicator,
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
import { Colors } from "@/constants/colors";
import { getSportTypeLabel } from "@/constants/match";
import { createMatch } from "@/services/matchesService";
import { SportType } from "@/types/sportType";
import { useLangStore } from "@/store/langStore";
import { Toast } from "@/components/Toast";
import DateTimePickerField from "@/components/DateTimePickerField";

const SPORT_TYPES = [
  SportType.Fut5,
  SportType.Fut7,
  SportType.Fut11,
  SportType.Futsal,
  SportType.Beach,
  SportType.Indoor,
];

export default function Create() {
  const t = useLangStore((s) => s.t);
  const sportTypeLabel = getSportTypeLabel(t);

  const [selectedType, setSelectedType] = useState<SportType>(SportType.Fut7);
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
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
      await createMatch({ type: selectedType, date: datetime.toISOString(), location: location.trim(), maxPlayers });
      showToast(t.matchCreated);
      setTimeout(() => router.replace("/(tabs)/matches"), 1200);
    } catch {
      showToast(t.createMatchError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>{t.createMatchTitle}</Text>

        {/* Sport type */}
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

        {/* Date & time */}
        <View style={styles.section}>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>{t.date}</Text>
              <DateTimePickerField mode="date" value={datetime} onChange={setDatetime} />
            </View>
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>{t.time}</Text>
              <DateTimePickerField mode="time" value={datetime} onChange={setDatetime} />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>{t.location}</Text>
          <TextInput
            style={styles.input}
            placeholder="Camp Nou, Barcelona"
            placeholderTextColor={Colors.muted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Max players */}
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

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.black} />
            : <Text style={styles.createBtnText}>{t.createMatchBtn}</Text>
          }
        </Pressable>
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },

  title: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },

  section: { gap: 10 },

  label: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  // Sport type grid
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typePill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typePillActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  typePillText: { color: Colors.muted, fontSize: 13, fontWeight: "600" },
  typePillTextActive: { color: Colors.black },

  // Date & time
  dateTimeRow: { flexDirection: "row", gap: 12 },
  dateTimeField: { flex: 1, gap: 10 },

  // Input
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  stepBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  stepBtnText: { color: Colors.white, fontSize: 22, fontWeight: "300" },
  stepValue: {
    minWidth: 56,
    textAlign: "center",
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  // Create button
  createBtn: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: { color: Colors.black, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
});

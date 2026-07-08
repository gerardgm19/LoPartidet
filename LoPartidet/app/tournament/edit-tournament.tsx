import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { getSportTypeLabel } from "@/constants/match";
import { getTournamentById, updateTournament, TournamentLocationInfo } from "@/services/tournamentsService";
import { getLocations, Location } from "@/services/locationsService";
import { SportType } from "@/types/sportType";
import { useLangStore } from "@/store/langStore";
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  errorText: { color: colors.muted, fontSize: 16 },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  locationChipText: { color: colors.white, fontSize: 15, fontWeight: "600", flex: 1 },
  locationChipDelete: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    backgroundColor: colors.surface,
  },
  emptyLocations: { color: colors.muted, fontSize: 14, paddingVertical: 4 },
  addLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.green,
    borderStyle: "dashed",
    paddingVertical: 14,
  },
  addLocationBtnText: { color: colors.green, fontSize: 15, fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { color: colors.white, fontSize: 16, fontWeight: "700", textAlign: "center" },
  sheetItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetItemText: { color: colors.white, fontSize: 16 },
  sheetEmpty: { color: colors.muted, fontSize: 15, textAlign: "center", paddingVertical: 24 },
}));

export default function EditTournament() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const sportTypeLabel = getSportTypeLabel(t);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [initializing, setInitializing] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
  const [locations, setLocations] = useState<TournamentLocationInfo[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    Promise.all([getTournamentById(id), getLocations().catch(() => [])])
      .then(([tournament, allLocations]) => {
        if (!tournament) { setNotFound(true); return; }
        setName(tournament.name);
        setSelectedType(tournament.sportType);
        setDatetime(new Date(tournament.startDate));
        setGroupsCount(tournament.groupsCount);
        setTeamsPerGroup(tournament.teamsPerGroup);
        setQualifiedPerGroup(tournament.qualifiedPerGroup);
        setIsSingleElimination(tournament.isSingleElimination);
        setHasThirdPlaceMatch(tournament.hasThirdPlaceMatch);
        setHalfDurationMinutes(tournament.halfDurationMinutes);
        setHalfTimeDurationMinutes(tournament.halfTimeDurationMinutes);
        setGapBetweenMatchesMinutes(tournament.gapBetweenMatchesMinutes);
        setLocations(tournament.locations ?? []);
        setAvailableLocations(allLocations);
      })
      .catch(() => setNotFound(true))
      .finally(() => setInitializing(false));
  }, [id]);

  const selectableLocations = availableLocations.filter(
    (loc) => !locations.some((l) => l.id === loc.id)
  );

  function addLocation(loc: Location) {
    setLocations((prev) => [...prev, { id: loc.id, name: loc.name }]);
    setLocationPickerOpen(false);
  }

  function removeLocation(locationId: number) {
    setLocations((prev) => prev.filter((l) => l.id !== locationId));
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
  }

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    setLoading(true);
    try {
      await updateTournament(id, {
        name: name.trim(),
        sportType: selectedType,
        startDate: `${datetime.getFullYear()}-${String(datetime.getMonth() + 1).padStart(2, "0")}-${String(datetime.getDate()).padStart(2, "0")}T${String(datetime.getHours()).padStart(2, "0")}:${String(datetime.getMinutes()).padStart(2, "0")}:00`,
        groupsCount,
        teamsPerGroup,
        qualifiedPerGroup,
        isSingleElimination,
        hasThirdPlaceMatch,
        halfDurationMinutes,
        halfTimeDurationMinutes,
        gapBetweenMatchesMinutes,
        locationIds: locations.map((l) => l.id),
      });
      showToast(t.tournamentUpdated);
      setTimeout(() => router.replace({ pathname: "/tournament/[id]", params: { id } }), 1200);
    } catch {
      showToast(t.updateTournamentError);
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navbar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.navTitle}>{t.editTournamentTitle}</Text>
          <View style={styles.navPlaceholder} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.tournamentNotFound}</Text>
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.navTitle}>{t.editTournamentTitle}</Text>
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
            <Text style={styles.label}>{t.tournamentLocations}</Text>
            {locations.length === 0
              ? <Text style={styles.emptyLocations}>{t.noLocations}</Text>
              : locations.map((loc) => (
                <View key={loc.id} style={styles.locationChip}>
                  <Text style={styles.locationChipText}>{loc.name}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.locationChipDelete, pressed && { opacity: 0.6 }]}
                    onPress={() => removeLocation(loc.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color={colors.red} />
                  </Pressable>
                </View>
              ))
            }
            <Pressable
              style={({ pressed }) => [styles.addLocationBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setLocationPickerOpen(true)}
            >
              <Ionicons name="add" size={18} color={colors.green} />
              <Text style={styles.addLocationBtnText}>{t.addLocation}</Text>
            </Pressable>
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
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.black} />
              : <Text style={styles.createBtnText}>{t.updateTournamentBtn}</Text>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={locationPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationPickerOpen(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setLocationPickerOpen(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.selectLocation}</Text>
            </View>
            {selectableLocations.length === 0
              ? <Text style={styles.sheetEmpty}>{t.noAvailableLocations}</Text>
              : (
                <FlatList
                  data={selectableLocations}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.sheetItem} onPress={() => addLocation(item)}>
                      <Text style={styles.sheetItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )
            }
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import { makeStyles } from "@/utils/makeStyles";
import BirthdayPicker from "@/components/BirthdayPicker";
import TimePicker from "@/components/TimePicker";
import { MatchFilter } from "@/services/matchesService";

type Props = {
  value: MatchFilter;
  onApply: (next: MatchFilter) => void;
  onClear: () => void;
};

const CURRENT_YEAR = new Date().getFullYear();
const DATE_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

const useStyles = makeStyles((colors) => StyleSheet.create({
  panel: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
  },
  field: { gap: 6 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1, gap: 6 },
  joinedRow: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: colors.black },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: colors.green },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 14, fontWeight: "700" },
}));

export default function MatchFilters({ value, onApply, onClear }: Props) {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);
  const t = useLangStore((s) => s.t);

  const [location, setLocation] = useState(value.location ?? "");
  const [joined, setJoined] = useState<boolean | undefined>(value.joined);
  const [minDate, setMinDate] = useState<string | undefined>(value.minDate);
  const [maxDate, setMaxDate] = useState<string | undefined>(value.maxDate);
  const [minTime, setMinTime] = useState<string | undefined>(value.minTime);
  const [maxTime, setMaxTime] = useState<string | undefined>(value.maxTime);

  function apply() {
    onApply({
      location: location.trim() || undefined,
      joined,
      minDate,
      maxDate,
      minTime,
      maxTime,
    });
  }

  function clear() {
    setLocation("");
    setJoined(undefined);
    setMinDate(undefined);
    setMaxDate(undefined);
    setMinTime(undefined);
    setMaxTime(undefined);
    onClear();
  }

  return (
    <View style={styles.panel}>
      <View style={styles.field}>
        <Text style={styles.label}>{t.filterLocation}</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t.filterLocation}
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t.filterJoined}</Text>
        <View style={styles.joinedRow}>
          <Pressable
            style={[styles.chip, joined === undefined && styles.chipActive]}
            onPress={() => setJoined(undefined)}
          >
            <Text style={[styles.chipText, joined === undefined && styles.chipTextActive]}>{t.any}</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, joined === true && styles.chipActive]}
            onPress={() => setJoined(true)}
          >
            <Text style={[styles.chipText, joined === true && styles.chipTextActive]}>{t.yes}</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, joined === false && styles.chipActive]}
            onPress={() => setJoined(false)}
          >
            <Text style={[styles.chipText, joined === false && styles.chipTextActive]}>{t.no}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t.filterMinDate}</Text>
        <BirthdayPicker
          label={t.filterMinDate}
          value={minDate}
          onChange={setMinDate}
          compact
          yearOptions={DATE_YEARS}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t.filterMaxDate}</Text>
        <BirthdayPicker
          label={t.filterMaxDate}
          value={maxDate}
          onChange={setMaxDate}
          compact
          yearOptions={DATE_YEARS}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>{t.filterMinTime}</Text>
          <TimePicker
            label={t.filterMinTime}
            value={minTime}
            onChange={setMinTime}
            minuteInterval={15}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>{t.filterMaxTime}</Text>
          <TimePicker
            label={t.filterMaxTime}
            value={maxTime}
            onChange={setMaxTime}
            minuteInterval={15}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnSecondary]} onPress={clear}>
          <Text style={[styles.btnText, { color: colors.white }]}>{t.clearFilters}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={apply}>
          <Text style={[styles.btnText, { color: colors.black }]}>{t.applyFilters}</Text>
        </Pressable>
      </View>
    </View>
  );
}

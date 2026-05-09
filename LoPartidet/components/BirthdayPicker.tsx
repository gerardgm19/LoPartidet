import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import { makeStyles } from "@/utils/makeStyles";
import type { Translations } from "@/i18n";

const CURRENT_YEAR = new Date().getFullYear();
const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 101 }, (_, i) => CURRENT_YEAR - i);

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function validDays(month: number | undefined, year: number | undefined): number[] {
  const max = month && year ? daysInMonth(month, year) : 31;
  return Array.from({ length: max }, (_, i) => i + 1);
}

function monthLabel(month: number, t: Translations): string {
  return [
    t.monthJanuary, t.monthFebruary, t.monthMarch, t.monthApril,
    t.monthMay, t.monthJune, t.monthJuly, t.monthAugust,
    t.monthSeptember, t.monthOctober, t.monthNovember, t.monthDecember,
  ][month - 1];
}

function toIso(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseValue(v: string | undefined): { day?: number; month?: number; year?: number } {
  if (!v) return {};
  // Accept both "yyyy-MM-dd" (DateOnly) and "yyyy-MM-ddTHH:mm:ss" (DateTime).
  const [y, m, d] = v.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return {};
  return { day: d, month: m, year: y };
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  field: { paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldError: { color: "#FF5252", fontSize: 12, marginTop: 2 },
  row: { flexDirection: "row", gap: 8 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownDay: { flex: 1 },
  dropdownMonth: { flex: 2 },
  dropdownYear: { flex: 1.3 },
  dropdownText: { color: colors.white, fontSize: 15 },
  dropdownPlaceholder: { color: colors.muted, fontSize: 15 },
  // Modal
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
  sheetTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemSelected: { backgroundColor: colors.surface },
  itemText: { color: colors.white, fontSize: 16 },
  itemTextSelected: { color: colors.green, fontSize: 16, fontWeight: "700" },
}));

// ─── Dropdown ─────────────────────────────────────────────────────────────────

type DropdownProps = {
  title: string;
  value: number | undefined;
  options: number[];
  placeholder: string;
  onSelect: (v: number) => void;
  renderLabel: (v: number) => string;
  containerStyle: object;
};

function Dropdown({
  title, value, options, placeholder, onSelect, renderLabel, containerStyle,
}: DropdownProps) {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, containerStyle]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={value !== undefined ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value !== undefined ? renderLabel(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.muted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              initialScrollIndex={value !== undefined ? Math.max(0, options.indexOf(value)) : 0}
              getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.item, isSelected && styles.itemSelected]}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={isSelected ? styles.itemTextSelected : styles.itemText}>
                      {renderLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── BirthdayPicker ───────────────────────────────────────────────────────────

type Props = {
  label: string;
  value: string | undefined;
  onChange: (iso: string | undefined) => void;
  error?: string;
  onLayout?: (e: any) => void;
  onFocus?: () => void;
};

export default function BirthdayPicker({
  label, value, onChange, error, onLayout, onFocus,
}: Props) {
  const styles = useStyles();
  const t = useLangStore((s) => s.t);

  const [state, setState] = useState(() => parseValue(value));

  function emit(next: { day?: number; month?: number; year?: number }) {
    if (next.day && next.month && next.year) {
      onChange(toIso(next.day, next.month, next.year));
    } else {
      onChange(undefined);
    }
  }

  function pick(part: "day" | "month" | "year", v: number) {
    onFocus?.();
    const next = { ...state, [part]: v };
    if (next.month && next.year && next.day) {
      const max = daysInMonth(next.month, next.year);
      if (next.day > max) next.day = max;
    }
    setState(next);
    emit(next);
  }

  const days = validDays(state.month, state.year);

  return (
    <View style={styles.field} onLayout={onLayout}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.row}>
        <Dropdown
          title={t.birthday}
          value={state.day}
          options={days}
          placeholder="DD"
          onSelect={(v) => pick("day", v)}
          renderLabel={(v) => String(v)}
          containerStyle={styles.dropdownDay}
        />
        <Dropdown
          title={t.birthday}
          value={state.month}
          options={ALL_MONTHS}
          placeholder="MM"
          onSelect={(v) => pick("month", v)}
          renderLabel={(v) => monthLabel(v, t)}
          containerStyle={styles.dropdownMonth}
        />
        <Dropdown
          title={t.birthday}
          value={state.year}
          options={YEARS}
          placeholder="YYYY"
          onSelect={(v) => pick("year", v)}
          renderLabel={(v) => String(v)}
          containerStyle={styles.dropdownYear}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

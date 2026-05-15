import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toHHmm(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

function parseValue(v: string | undefined): { hour?: number; minute?: number } {
  if (!v) return {};
  const [h, m] = v.slice(0, 5).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return {};
  return { hour: h, minute: m };
}

function buildMinutes(interval: number): number[] {
  const step = Math.max(1, Math.min(60, Math.floor(interval)));
  const minutes: number[] = [];
  for (let m = 0; m < 60; m += step) minutes.push(m);
  return minutes;
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  field: { gap: 6 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldError: { color: "#FF5252", fontSize: 12, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "web" ? 4 : 2,
  },
  sep: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 2,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    minWidth: 56,
  },
  dropdownHalf: { flex: 1 },
  dropdownText: { color: colors.white, fontSize: 15 },
  dropdownPlaceholder: { color: colors.muted, fontSize: 15 },
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
        <Text
          style={[value !== undefined ? styles.dropdownText : styles.dropdownPlaceholder, { flexShrink: 1 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => { }}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              initialNumToRender={options.length}
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

type Props = {
  label: string;
  value: string | undefined;
  onChange: (hhmm: string | undefined) => void;
  minuteInterval: number;
  error?: string;
  onLayout?: (e: any) => void;
  onFocus?: () => void;
};

export default function TimePicker({
  label, value, onChange, minuteInterval, error, onLayout, onFocus,
}: Props) {
  const styles = useStyles();
  const minutes = buildMinutes(minuteInterval);

  const [state, setState] = useState(() => parseValue(value));

  useEffect(() => {
    const parsed = parseValue(value);
    setState((prev) => {
      if (prev.hour === parsed.hour && prev.minute === parsed.minute) return prev;
      return parsed;
    });
  }, [value]);

  function emit(next: { hour?: number; minute?: number }) {
    if (next.hour !== undefined && next.minute !== undefined) {
      onChange(toHHmm(next.hour, next.minute));
    } else {
      onChange(undefined);
    }
  }

  function pick(part: "hour" | "minute", v: number) {
    onFocus?.();
    const next = { ...state, [part]: v };
    setState(next);
    emit(next);
  }

  return (
    <View style={styles.field} onLayout={onLayout}>
      <View style={styles.row}>
        <Dropdown
          title={label}
          value={state.hour}
          options={HOURS}
          placeholder="HH"
          onSelect={(v) => pick("hour", v)}
          renderLabel={(v) => pad(v)}
          containerStyle={styles.dropdown}
        />
        <Text style={styles.sep}>:</Text>
        <Dropdown
          title={label}
          value={state.minute}
          options={minutes}
          placeholder="MM"
          onSelect={(v) => pick("minute", v)}
          renderLabel={(v) => pad(v)}
          containerStyle={styles.dropdown}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

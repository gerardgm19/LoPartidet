import { useRef } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

type Props = {
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
};

export default function DateTimePickerField({ mode, value, onChange }: Props) {
  return mode === "date"
    ? <DateField value={value} onChange={onChange} />
    : <TimeField value={value} onChange={onChange} />;
}

// ---------------------------------------------------------------------------
// Date field  ·  DD / MM / YYYY
// ---------------------------------------------------------------------------

const useStyles = makeStyles((colors) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
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
  segment: {
    color: colors.white,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minWidth: 30,
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, borderWidth: 0 } as object) : {}),
  },
  segmentWide: {
    minWidth: 46,
  },
}));

function DateField({ value, onChange }: Omit<Props, "mode">) {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);
  const monthRef = useRef<TextInput>(null);
  const yearRef  = useRef<TextInput>(null);

  const day   = value.getDate();
  const month = value.getMonth() + 1;
  const year  = value.getFullYear();

  function commit(d: number, m: number, y: number) {
    const next = new Date(value);
    next.setFullYear(clamp(y, 1900, 2100), clamp(m - 1, 0, 11), clamp(d, 1, 31));
    onChange(next);
  }

  return (
    <View style={styles.row}>
      <Segment styles={styles} colors={colors} value={String(day)} maxLength={2} placeholder="DD"
        onChangeText={(v) => { commit(num(v), month, year); if (v.length === 2) monthRef.current?.focus(); }}
      />
      <Text style={styles.sep}>/</Text>
      <Segment ref={monthRef} styles={styles} colors={colors} value={String(month)} maxLength={2} placeholder="MM"
        onChangeText={(v) => { commit(day, num(v), year); if (v.length === 2) yearRef.current?.focus(); }}
      />
      <Text style={styles.sep}>/</Text>
      <Segment ref={yearRef} styles={styles} colors={colors} value={String(year)} maxLength={4} placeholder="YYYY" wide
        onChangeText={(v) => commit(day, month, num(v))}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Time field  ·  HH : MM
// ---------------------------------------------------------------------------

function TimeField({ value, onChange }: Omit<Props, "mode">) {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);
  const minRef = useRef<TextInput>(null);

  const hours   = value.getHours();
  const minutes = value.getMinutes();

  function commit(h: number, m: number) {
    const next = new Date(value);
    next.setHours(clamp(h, 0, 23), clamp(m, 0, 59), 0, 0);
    onChange(next);
  }

  return (
    <View style={styles.row}>
      <Segment styles={styles} colors={colors} value={String(hours)} maxLength={2} placeholder="HH"
        onChangeText={(v) => { commit(num(v), minutes); if (v.length === 2) minRef.current?.focus(); }}
      />
      <Text style={styles.sep}>:</Text>
      <Segment ref={minRef} styles={styles} colors={colors} value={String(minutes)} maxLength={2} placeholder="MM"
        onChangeText={(v) => commit(hours, num(v))}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Shared segment input
// ---------------------------------------------------------------------------

type SegmentStyles = { segment: object; segmentWide: object };

type SegmentProps = {
  ref?: React.Ref<TextInput>;
  styles: SegmentStyles;
  colors: { muted: string };
  value: string;
  maxLength: number;
  placeholder: string;
  wide?: boolean;
  onChangeText: (v: string) => void;
};

function Segment({ ref, styles, colors, value, maxLength, placeholder, wide, onChangeText }: SegmentProps) {
  return (
    <TextInput
      ref={ref}
      style={[styles.segment, wide && styles.segmentWide]}
      value={value}
      onChangeText={(raw) => {
        const digits = raw.replace(/\D/g, "").slice(0, maxLength);
        onChangeText(digits);
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={maxLength}
      selectTextOnFocus
      textAlign="center"
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function num(s: string): number {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

import { useState } from "react";
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

const useStyles = makeStyles((colors) => StyleSheet.create({
  field: { gap: 6 },
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    minWidth: 90,
  },
  text: { color: colors.white, fontSize: 15 },
  placeholder: { color: colors.muted, fontSize: 15 },
  suffix: { color: colors.muted, fontSize: 13 },
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

type Props = {
  label: string;
  value: number | undefined;
  options: number[];
  onChange: (v: number) => void;
  placeholder?: string;
  unitSuffix?: string;
  onLayout?: (e: any) => void;
};

export default function DurationPicker({
  label, value, options, onChange, placeholder = "--", unitSuffix = "min", onLayout,
}: Props) {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field} onLayout={onLayout}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => setOpen(true)} activeOpacity={0.7}>
          <Text
            style={value !== undefined ? styles.text : styles.placeholder}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value !== undefined ? `${value} ${unitSuffix}` : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
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
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={isSelected ? styles.itemTextSelected : styles.itemText}>
                      {item} {unitSuffix}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

const useStyles = makeStyles((colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
  },
  sheet: {
    margin: 32,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  title: { color: colors.white, fontSize: 17, fontWeight: "700", textAlign: "center" },
  message: { color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 8 },
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  btnCancel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  btnCancelText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  btnConfirmText: { fontSize: 15, fontWeight: "700" },
}));

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();

  const confirmBg = destructive ? colors.red : colors.green;
  const confirmFg = destructive ? colors.white : colors.black;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
              <Text style={styles.btnCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: confirmBg }]} onPress={onConfirm}>
              <Text style={[styles.btnConfirmText, { color: confirmFg }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

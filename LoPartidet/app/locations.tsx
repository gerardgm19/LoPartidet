import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { useLangStore } from "@/store/langStore";
import {
  createLocation,
  deleteLocation,
  getLocations,
  Location,
  updateLocation,
} from "@/services/locationsService";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";

const useStyles = makeStyles((colors) => StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { color: colors.white, fontSize: 18, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: colors.white, fontSize: 16, fontWeight: "600" },
  rowDescription: { color: colors.muted, fontSize: 13 },
  chevron: { color: colors.muted, fontSize: 22, lineHeight: 24 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: colors.muted, fontSize: 14, textAlign: "center", paddingHorizontal: 24 },

  // Editor modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  sheetTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  field: { gap: 6 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  input: {
    color: colors.white,
    fontSize: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  fieldError: { color: colors.red, fontSize: 12 },
  saveBtn: { paddingVertical: 14, backgroundColor: colors.green, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: colors.black, fontSize: 16, fontWeight: "700" },
  deleteBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  deleteBtnText: { color: colors.red, fontSize: 15, fontWeight: "600" },
}));

export default function Locations() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();

  const [locations, setLocations] = useState<Location[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
  }

  function loadLocations() {
    getLocations().then(setLocations).catch(() => showToast(t.locationsError));
  }

  useEffect(() => {
    loadLocations();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setNameError("");
    setEditorVisible(true);
  }

  function openEdit(location: Location) {
    setEditing(location);
    setName(location.name);
    setDescription(location.description);
    setNameError("");
    setEditorVisible(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(t.validationRequired);
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim() };
      if (editing) {
        await updateLocation(editing.id, payload);
        showToast(t.locationUpdated);
      } else {
        await createLocation(payload);
        showToast(t.locationCreated);
      }
      setEditorVisible(false);
      loadLocations();
    } catch (error: any) {
      showToast(error?.response?.data ?? t.locationSaveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    setConfirmDeleteVisible(false);
    try {
      await deleteLocation(editing.id);
      setEditorVisible(false);
      showToast(t.locationDeleted);
      loadLocations();
    } catch (error: any) {
      showToast(error?.response?.data ?? t.locationDeleteError);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.locationsTitle}</Text>
          <TouchableOpacity onPress={openCreate} style={styles.headerBtn}>
            <Ionicons name="add" size={26} color={colors.green} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {locations.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyTitle}>{t.noLocationsTitle}</Text>
              <Text style={styles.emptySubtitle}>{t.noLocationsSubtitle}</Text>
            </View>
          ) : (
            locations.map((location) => (
              <TouchableOpacity key={location.id} style={styles.row} onPress={() => openEdit(location)}>
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{location.name}</Text>
                  {location.description ? (
                    <Text style={styles.rowDescription} numberOfLines={2}>{location.description}</Text>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Editor */}
      <Modal
        visible={editorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditorVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.overlay} onPress={() => setEditorVisible(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>
                {editing ? t.editLocationTitle : t.newLocationTitle}
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t.locationName}</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(v) => { setName(v); if (nameError) setNameError(""); }}
                  placeholder={t.locationNamePlaceholder}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                />
                {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t.locationDescription}</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t.locationDescriptionPlaceholder}
                  placeholderTextColor={colors.muted}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{t.save}</Text>
              </TouchableOpacity>

              {editing ? (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmDeleteVisible(true)}>
                  <Text style={styles.deleteBtnText}>{t.delete}</Text>
                </TouchableOpacity>
              ) : null}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title={t.deleteLocationTitle}
        message={t.deleteLocationMessage}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
        destructive
      />

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </>
  );
}

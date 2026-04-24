import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { ColorPalette } from "@/constants/colors";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";
import { getUserById, updateUser } from "@/services/usersService";
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
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { color: colors.white, fontSize: 18, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.green, borderRadius: 20 },
  saveBtnText: { color: colors.black, fontSize: 14, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 24 },
  card: { backgroundColor: colors.card, borderRadius: 16, overflow: "hidden" },
  field: { paddingHorizontal: 16, paddingVertical: 14, gap: 4 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldInput: { color: colors.white, fontSize: 16, paddingVertical: 2 },
  fieldError: { color: "#FF5252", fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 16 },
}));

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string {
  const [d, m, y] = display.split("/");
  return `${y}-${m}-${d}`;
}

function isValidDisplayDate(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PlayerInformation() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { userId } = useAuthStore();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;
    getUserById(Number(userId)).then((user) => {
      if (!user) return;
      setName(user.name);
      setSurname(user.surname);
      setNickname(user.nickname);
      setEmail(user.email);
      setCity(user.city);
      if (user.birthday) setBirthday(isoToDisplay(user.birthday));
    }).catch(() => {});
  }, [userId]);

  async function handleSave() {
    if (!userId) return;

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = t.validationRequired;
    if (!surname.trim()) nextErrors.surname = t.validationRequired;
    if (!nickname.trim()) nextErrors.nickname = t.validationRequired;
    if (!email.trim()) nextErrors.email = t.validationRequired;
    else if (!isValidEmail(email)) nextErrors.email = t.validationEmail;
    if (birthday && !isValidDisplayDate(birthday)) nextErrors.birthday = t.validationBirthday;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateUser(Number(userId), { name, surname, nickname, email, city, birthday: birthday ? displayToIso(birthday) : undefined });
      setToastMessage(t.playerInformationSaved);
      setToastVisible(true);
    } catch {
      setToastMessage(t.playerInformationError);
      setToastVisible(true);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.playerInformationTitle}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.name} value={name} onChangeText={setName} placeholder={t.enterName} autoCapitalize="words" error={errors.name} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.surname} value={surname} onChangeText={setSurname} placeholder={t.enterSurname} autoCapitalize="words" error={errors.surname} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.nickname} value={nickname} onChangeText={setNickname} placeholder={t.enterNickname} autoCapitalize="none" error={errors.nickname} />
            </View>

            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.email} value={email} onChangeText={setEmail} placeholder={t.enterEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.city} value={city} onChangeText={setCity} placeholder={t.enterCity} autoCapitalize="words" />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.birthday} value={birthday} onChangeText={setBirthday} placeholder={t.birthdayPlaceholder} keyboardType="numeric" maxLength={10} error={errors.birthday} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
      </SafeAreaView>
    </>
  );
}

type FieldStyles = {
  field: object;
  fieldLabel: object;
  fieldInput: object;
  fieldError: object;
};

function Field({
  styles, colors, label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength, error,
}: {
  styles: FieldStyles;
  colors: ColorPalette;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  maxLength?: number;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

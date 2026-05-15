import { useEffect, useRef, useState } from "react";
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
import BirthdayPicker from "@/components/BirthdayPicker";

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
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.black,
  },
  saveBtn: { paddingVertical: 12, backgroundColor: colors.green, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: colors.black, fontSize: 16, fontWeight: "700" },
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PlayerInformation() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { userId } = useAuthStore();

  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});

  function focusScroll(key: string) {
    const y = fieldY.current[key];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
  }

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState<string | undefined>(undefined);
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
      if (user.birthday) setBirthday(user.birthday);
    }).catch(() => { });
  }, [userId]);

  async function handleSave() {
    if (!userId) return;

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = t.validationRequired;
    if (!surname.trim()) nextErrors.surname = t.validationRequired;
    if (!nickname.trim()) nextErrors.nickname = t.validationRequired;
    if (!email.trim()) nextErrors.email = t.validationRequired;
    else if (!isValidEmail(email)) nextErrors.email = t.validationEmail;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateUser(Number(userId), { name, surname, nickname, email, city, birthday });
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.playerInformationTitle}</Text>
          <View style={styles.backBtn} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.name} value={name} onChangeText={setName} placeholder={t.enterName} autoCapitalize="words" error={errors.name} onLayout={(e) => { fieldY.current.name = e.nativeEvent.layout.y; }} onFocus={() => focusScroll("name")} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.surname} value={surname} onChangeText={setSurname} placeholder={t.enterSurname} autoCapitalize="words" error={errors.surname} onLayout={(e) => { fieldY.current.surname = e.nativeEvent.layout.y; }} onFocus={() => focusScroll("surname")} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.nickname} value={nickname} onChangeText={setNickname} placeholder={t.enterNickname} autoCapitalize="none" error={errors.nickname} onLayout={(e) => { fieldY.current.nickname = e.nativeEvent.layout.y; }} onFocus={() => focusScroll("nickname")} />
            </View>

            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.email} value={email} onChangeText={setEmail} placeholder={t.enterEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} onLayout={(e) => { fieldY.current.email = e.nativeEvent.layout.y; }} onFocus={() => focusScroll("email")} />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.city} value={city} onChangeText={setCity} placeholder={t.enterCity} autoCapitalize="words" onLayout={(e) => { fieldY.current.city = e.nativeEvent.layout.y; }} onFocus={() => focusScroll("city")} />
              <View style={styles.divider} />
              <BirthdayPicker
                label={t.birthday}
                value={birthday}
                onChange={setBirthday}
                onLayout={(e) => { fieldY.current.birthday = e.nativeEvent.layout.y; }}
                onFocus={() => focusScroll("birthday")} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
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
  styles, colors, label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength, error, onFocus, onLayout,
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
  onFocus?: () => void;
  onLayout?: (e: any) => void;
}) {
  return (
    <View style={styles.field} onLayout={onLayout}>
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
        onFocus={onFocus}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

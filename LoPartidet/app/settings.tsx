import { useState } from "react";
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
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 16 },
}));

export default function Settings() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState("");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.settingsTitle}</Text>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.name} value={name} onChangeText={setName} placeholder={t.enterName} autoCapitalize="words" />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.surname} value={surname} onChangeText={setSurname} placeholder={t.enterSurname} autoCapitalize="words" />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.nickname} value={nickname} onChangeText={setNickname} placeholder={t.enterNickname} autoCapitalize="none" />
            </View>

            <View style={styles.card}>
              <Field styles={styles} colors={colors} label={t.email} value={email} onChangeText={setEmail} placeholder={t.enterEmail} keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.city} value={city} onChangeText={setCity} placeholder={t.enterCity} autoCapitalize="words" />
              <View style={styles.divider} />
              <Field styles={styles} colors={colors} label={t.birthday} value={birthday} onChangeText={setBirthday} placeholder={t.birthdayPlaceholder} keyboardType="numeric" maxLength={10} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

type FieldStyles = {
  field: object;
  fieldLabel: object;
  fieldInput: object;
};

function Field({
  styles, colors, label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength,
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
    </View>
  );
}

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
import { Colors } from "@/constants/colors";
import { useLangStore } from "@/store/langStore";

export default function Settings() {
  const t = useLangStore((s) => s.t);
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
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
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
              <Field label={t.name} value={name} onChangeText={setName} placeholder={t.enterName} autoCapitalize="words" />
              <Divider />
              <Field label={t.surname} value={surname} onChangeText={setSurname} placeholder={t.enterSurname} autoCapitalize="words" />
              <Divider />
              <Field label={t.nickname} value={nickname} onChangeText={setNickname} placeholder={t.enterNickname} autoCapitalize="none" />
            </View>

            <View style={styles.card}>
              <Field label={t.email} value={email} onChangeText={setEmail} placeholder={t.enterEmail} keyboardType="email-address" autoCapitalize="none" />
              <Divider />
              <Field label={t.city} value={city} onChangeText={setCity} placeholder={t.enterCity} autoCapitalize="words" />
              <Divider />
              <Field label={t.birthday} value={birthday} onChangeText={setBirthday} placeholder={t.birthdayPlaceholder} keyboardType="numeric" maxLength={10} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength,
}: {
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
        placeholderTextColor={Colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        maxLength={maxLength}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.green, borderRadius: 20 },
  saveBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 16, overflow: "hidden" },
  field: { paddingHorizontal: 16, paddingVertical: 14, gap: 4 },
  fieldLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldInput: { color: Colors.white, fontSize: 16, paddingVertical: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 16 },
});

import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { register } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyles = makeStyles((colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.green,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 40,
  },
  form: { gap: 12 },
  label: { fontSize: 13, color: colors.muted, marginBottom: -4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.white,
  },
  error: { fontSize: 13, color: "#FF5252", textAlign: "center" },
  button: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "600", color: colors.black },
  link: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8 },
  linkAccent: { color: colors.green },
}));

export default function RegisterScreen() {
  const { signIn } = useAuthStore();
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const { token, userId } = await register(
        email.trim(),
        password,
        name.trim(),
        surname.trim(),
        nickname.trim()
      );
      await signIn(token, userId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t.createAccount}</Text>
          <Text style={styles.subtitle}>{t.joinTagline}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>{t.name}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.namePlaceholder}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t.surname}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.surnamePlaceholder}
              placeholderTextColor={colors.muted}
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.label}>{t.nickname}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.nicknamePlaceholder}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              value={nickname}
              onChangeText={setNickname}
            />

            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{t.password}</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={styles.buttonText}>{t.register}</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.link}>
                {t.alreadyAccount}
                <Text style={styles.linkAccent}>{t.signInLink}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

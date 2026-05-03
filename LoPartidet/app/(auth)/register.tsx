import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { register } from "@/services/authService";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
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

  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});

  const surnameRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  function focusScroll(key: string) {
    const y = fieldY.current[key];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
  }

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
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t.createAccount}</Text>
          <Text style={styles.subtitle}>{t.joinTagline}</Text>

          <View style={styles.form}>
            <View onLayout={(e) => { fieldY.current.name = e.nativeEvent.layout.y; }}>
              <Text style={styles.label}>{t.name}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.namePlaceholder}
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
                textContentType="givenName"
                autoComplete="given-name"
                returnKeyType="next"
                onFocus={() => focusScroll("name")}
                onSubmitEditing={() => surnameRef.current?.focus()}
                blurOnSubmit={false}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View onLayout={(e) => { fieldY.current.surname = e.nativeEvent.layout.y; }}>
              <Text style={styles.label}>{t.surname}</Text>
              <TextInput
                ref={surnameRef}
                style={styles.input}
                placeholder={t.surnamePlaceholder}
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
                textContentType="familyName"
                autoComplete="family-name"
                returnKeyType="next"
                onFocus={() => focusScroll("surname")}
                onSubmitEditing={() => nicknameRef.current?.focus()}
                blurOnSubmit={false}
                value={surname}
                onChangeText={setSurname}
              />
            </View>

            <View onLayout={(e) => { fieldY.current.nickname = e.nativeEvent.layout.y; }}>
              <Text style={styles.label}>{t.nickname}</Text>
              <TextInput
                ref={nicknameRef}
                style={styles.input}
                placeholder={t.nicknamePlaceholder}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
                onFocus={() => focusScroll("nickname")}
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                value={nickname}
                onChangeText={setNickname}
              />
            </View>

            <View onLayout={(e) => { fieldY.current.email = e.nativeEvent.layout.y; }}>
              <Text style={styles.label}>{t.email}</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder={t.emailPlaceholder}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                onFocus={() => focusScroll("email")}
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View onLayout={(e) => { fieldY.current.password = e.nativeEvent.layout.y; }}>
              <Text style={styles.label}>{t.password}</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="go"
                onFocus={() => focusScroll("password")}
                onSubmitEditing={handleRegister}
                value={password}
                onChangeText={setPassword}
              />
            </View>

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

import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";
import { Lang } from "@/i18n";
import { getUserById, User } from "@/services/usersService";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scroll: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: "center",
  },
  title: {
    alignSelf: "flex-start",
    color: colors.white,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 36,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: colors.green, fontSize: 36, fontWeight: "700" },
  name: { color: colors.white, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  sub: { color: colors.muted, fontSize: 14 },
  divider: { width: "100%", height: 1, backgroundColor: colors.border, marginVertical: 32 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { color: colors.green, fontSize: 28, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  statSep: { width: 1, height: 40, backgroundColor: colors.border },
  menu: { width: "100%", backgroundColor: colors.card, borderRadius: 16 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { color: colors.white, fontSize: 16, fontWeight: "500" },
  menuChevron: { color: colors.muted, fontSize: 22, lineHeight: 24 },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuRightText: { color: colors.muted, fontSize: 14 },
  signOutLabel: { color: colors.red },

  // Theme toggle
  themeToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  themeBtnActive: {
    backgroundColor: colors.green,
  },
  themeBtnText: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  themeBtnTextActive: { color: colors.black, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 4,
  },
  modalTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: { color: colors.white, fontSize: 16, fontWeight: "500" },
  modalOptionActive: { color: colors.green, fontWeight: "700" },
}));

export default function Profile() {
  const t = useLangStore((s) => s.t);
  const { lang, setLang } = useLangStore();
  const { signOut, userId } = useAuthStore();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { theme, setTheme, colors } = useThemeStore();
  const styles = useStyles();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getUserById(Number(userId)).then(setUser).catch(() => { });
  }, [userId]);

  async function handleSignOut() {
    setSignOutModalVisible(false);
    await signOut();
    router.replace("/(auth)/login");
  }

  const LANGUAGES: { value: Lang; label: string }[] = [
    { value: "es_es", label: t.langSpanish },
    { value: "cat_es", label: t.langCatalan },
  ];

  const menuItems = [
    { label: t.myMatches, route: "/user-matches" },
    { label: t.skills, route: "/skills" },
    { label: t.playerInformation, route: "/player-information" },
    ...(isAdmin ? [{ label: t.manageLocations, route: "/locations" }] : []),
    { label: t.aboutUs, route: "/about-us" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.profile}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <Text style={styles.name}>{user ? `${user.name} ${user.surname}` : t.notFoundUser}</Text>
        <Text style={styles.sub}>{user?.city || t.noCityYet}</Text>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statMatches}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statGoals}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statWins}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Theme toggle */}
          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} activeOpacity={1}>
            <Text style={styles.menuLabel}>{t.theme}</Text>
            <View style={styles.themeToggle}>
              <Pressable
                style={[styles.themeBtn, theme === "dark" && styles.themeBtnActive]}
                onPress={() => setTheme("dark")}
              >
                <Text style={[styles.themeBtnText, theme === "dark" && styles.themeBtnTextActive]}>
                  {t.themeDark}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.themeBtn, theme === "light" && styles.themeBtnActive]}
                onPress={() => setTheme("light")}
              >
                <Text style={[styles.themeBtnText, theme === "light" && styles.themeBtnTextActive]}>
                  {t.themeLight}
                </Text>
              </Pressable>
            </View>
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => setLangModalVisible(true)}
          >
            <Text style={styles.menuLabel}>{t.language}</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuRightText}>
                {LANGUAGES.find((l) => l.value === lang)?.label}
              </Text>
              <Text style={styles.menuChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setSignOutModalVisible(true)}
          >
            <Text style={[styles.menuLabel, styles.signOutLabel]}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sign-out dialog */}
      <ConfirmDialog
        visible={signOutModalVisible}
        title={t.signOutConfirmTitle}
        message={t.signOutConfirmMessage}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={handleSignOut}
        onCancel={() => setSignOutModalVisible(false)}
        destructive
      />

      {/* Language picker */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.value}
                style={styles.modalOption}
                onPress={() => { setLang(l.value); setLangModalVisible(false); }}
              >
                <Text style={[styles.modalOptionText, lang === l.value && styles.modalOptionActive]}>
                  {l.label}
                </Text>
                {lang === l.value && (
                  <Ionicons name="checkmark" size={18} color={colors.green} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

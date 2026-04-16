import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { ColorPalette, darkColors, lightColors } from "@/constants/colors";

export type Theme = "dark" | "light";

const THEME_KEY = "app_theme";
const DEFAULT_THEME: Theme = "dark";

type ThemeStore = {
  theme: Theme;
  colors: ColorPalette;
  initialize: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: DEFAULT_THEME,
  colors: darkColors,

  initialize: async () => {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    const theme: Theme = stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
    set({ theme, colors: theme === "dark" ? darkColors : lightColors });
  },

  setTheme: async (theme) => {
    await AsyncStorage.setItem(THEME_KEY, theme);
    set({ theme, colors: theme === "dark" ? darkColors : lightColors });
  },

  toggleTheme: async () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    await AsyncStorage.setItem(THEME_KEY, next);
    set({ theme: next, colors: next === "dark" ? darkColors : lightColors });
  },
}));

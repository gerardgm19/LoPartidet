import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Lang, Translations, translations } from "@/i18n";

const LANG_KEY = "app_lang";
const DEFAULT_LANG: Lang = "es_es";

type LangStore = {
  lang: Lang;
  t: Translations;
  initialize: () => Promise<void>;
  setLang: (lang: Lang) => Promise<void>;
};

export const useLangStore = create<LangStore>((set) => ({
  lang: DEFAULT_LANG,
  t: translations[DEFAULT_LANG],

  initialize: async () => {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    const lang: Lang = stored === "cat_es" || stored === "es_es" ? stored : DEFAULT_LANG;
    set({ lang, t: translations[lang] });
  },

  setLang: async (lang) => {
    await AsyncStorage.setItem(LANG_KEY, lang);
    set({ lang, t: translations[lang] });
  },
}));

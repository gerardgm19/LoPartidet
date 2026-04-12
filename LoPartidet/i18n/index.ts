import cat_es from "./cat_es";
import es_es from "./es_es";

export type Lang = "cat_es" | "es_es";
export type Translations = typeof es_es;

export const translations: Record<Lang, Translations> = { cat_es, es_es };

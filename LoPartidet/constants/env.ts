import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra ?? {};

const isDebug: boolean = extra.apiDebug ?? false;

function resolveUrl(android: string, ios: string, prod: string): string {
  if (!isDebug) return prod;
  return Platform.OS === "android" ? android : ios;
}

export const API_BASE_URL: string = resolveUrl(
  extra.apiBaseUrlAndroid,
  extra.apiBaseUrlIos,
  extra.apiBaseUrlProd,
);

export const AUTH_BASE_URL: string = resolveUrl(
  extra.authBaseUrlAndroid,
  extra.authBaseUrlIos,
  extra.authBaseUrlProd,
);

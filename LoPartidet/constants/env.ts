import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra ?? {};

const isDebug: boolean = extra.apiDebug ?? false;

function resolveUrl(android: string, ios: string, prod: string): string {
  if (!isDebug) return prod;
  return Platform.OS === "android" ? android : ios;
}

// export const API_BASE_URL: string = resolveUrl(
//   extra.apiBaseUrlAndroid,
//   extra.apiBaseUrlIos,
//   extra.apiBaseUrlProd,
// );

// export const AUTH_BASE_URL: string = resolveUrl(
//   extra.authBaseUrlAndroid,
//   extra.authBaseUrlIos,
//   extra.authBaseUrlProd,
// );

export const AUTH_BASE_URL: string = "https://floppy-weeks-visitors-maui.trycloudflare.com/identitymanager";
export const API_BASE_URL: string = "https://floppy-weeks-visitors-maui.trycloudflare.com/lopartidet_api";
export const LOCAL_AUTH_BASE_URL: string = "http://localhost:10002";
export const LOCAL_API_BASE_URL: string = "http://localhost:10004";
export const PROD_AUTH_BASE_URL: string = "https://178.33.119.182:10099/identitymanager";
export const PROD_API_BASE_URL: string = "https://178.33.119.182:10099/lopartidet_api";
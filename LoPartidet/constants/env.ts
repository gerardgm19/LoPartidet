import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra ?? {};

function resolveUrl(debug: string, prod: string): string {
  if (!isDebug) return prod;
  return debug;
}

const isDebug = true;
const apiIdentityCloudflareUrl: string = "https://identity.lopartidet.cat";
const apiLoPartidetCloudflareUrl: string = "https://api.lopartidet.cat";
const apiIdentityLocalhostUrl: string = "http://localhost:10002";
const apiLoPartidetLocalhostUrl: string = "http://localhost:10004";
const apiIdentityIpUrl: string = "https://178.33.119.182:10099/identitymanager";
const apiLoPartidetIprl: string = "https://178.33.119.182:10099/lopartidet_api";

export const AUTH_BASE_URL: string = resolveUrl(
  apiIdentityLocalhostUrl,
  apiIdentityCloudflareUrl,
);

export const API_BASE_URL: string = resolveUrl(
  apiLoPartidetLocalhostUrl,
  apiLoPartidetCloudflareUrl,
);
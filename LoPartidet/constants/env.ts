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
const apiAndroidIdentityIpUrl: string = "http://192.168.0.13:10002";
const apiAndroidLoPartidetIprl: string = "http://192.168.0.13:10004";

export const AUTH_BASE_URL: string = resolveUrl(
  apiIdentityLocalhostUrl,
  //apiAndroidIdentityIpUrl,
  apiIdentityCloudflareUrl,
);

export const API_BASE_URL: string = resolveUrl(
  apiLoPartidetLocalhostUrl,
  //apiAndroidLoPartidetIprl,
  apiLoPartidetCloudflareUrl,
);
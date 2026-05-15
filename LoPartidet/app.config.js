module.exports = {
  expo: {
    name: "LoPartidet",
    slug: "LoPartidet",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lopartidet",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1C1C1C",
        foregroundImage: "./assets/images/icon.png",
        monochromeImage: "./assets/images/icon.png",
      },
      usesCleartextTraffic: true,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      "package": "com.gerardgm.LoPartidet",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1C1C1C",
          dark: { backgroundColor: "#1C1C1C" },
        },
      ],
      "expo-secure-store",
      "@react-native-community/datetimepicker",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiDebug: process.env.EXPO_PUBLIC_API_DEBUG === "true",
      apiBaseUrlAndroid: process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID,
      apiBaseUrlIos: process.env.EXPO_PUBLIC_API_BASE_URL_IOS,
      apiBaseUrlProd: process.env.EXPO_PUBLIC_API_BASE_URL_PROD,
      authBaseUrlAndroid: process.env.EXPO_PUBLIC_AUTH_BASE_URL_ANDROID,
      authBaseUrlIos: process.env.EXPO_PUBLIC_AUTH_BASE_URL_IOS,
      authBaseUrlProd: process.env.EXPO_PUBLIC_AUTH_BASE_URL_PROD,
      eas: {
        "projectId": "dc4d462e-09ea-485e-b9d5-cf18769a44d4"
      }
    },
  },
};

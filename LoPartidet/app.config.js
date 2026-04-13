module.exports = {
  expo: {
    name: "LoPartidet",
    slug: "LoPartidet",
    version: "1.0.0",
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
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiDebug: process.env.API_DEBUG === "true",
      apiBaseUrlAndroid: process.env.API_BASE_URL_ANDROID,
      apiBaseUrlIos:     process.env.API_BASE_URL_IOS,
      apiBaseUrlProd:    process.env.API_BASE_URL_PROD,
      authBaseUrlAndroid: process.env.AUTH_BASE_URL_ANDROID,
      authBaseUrlIos:     process.env.AUTH_BASE_URL_IOS,
      authBaseUrlProd:    process.env.AUTH_BASE_URL_PROD,
    },
  },
};

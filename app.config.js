
export default {
  name: "FitFlow",
  slug: "fit-flow-scan-track",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.lovable.fitflow"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "app.lovable.fitflow"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router"
  ],
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  }
};

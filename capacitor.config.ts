
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.37742df757d04f2caadbfc4b8e0fd588',
  appName: 'fit-flow-scan-track',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://37742df7-57d0-4f2c-aadb-fc4b8e0fd588.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2DD4BF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

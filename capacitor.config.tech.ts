import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.portfolio.technician',
  appName: 'Wiga Staff',
  webDir: 'dist-tech',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  android: {
    path: 'android-tech'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;

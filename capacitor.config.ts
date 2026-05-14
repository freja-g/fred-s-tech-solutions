import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.portfolio.app',
  appName: 'Portfolio App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;

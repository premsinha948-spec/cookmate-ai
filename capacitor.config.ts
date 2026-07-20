import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vercel.cookmate_ai_xi.twa',
  appName: 'CookMate AI',
  webDir: 'build',
  server: {
    url: 'https://cookmate-ai-xi.vercel.app',
    cleartext: true,
    androidScheme: 'https',
    hostname: 'cookmate-ai-xi.vercel.app'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vercel.cookmate_ai_xi.twa',
  appName: 'CookMate AI',
  webDir: 'build',

  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
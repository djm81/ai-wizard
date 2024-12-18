import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  source: {
    define: {
      'import.meta.env.PUBLIC_FIREBASE_API_KEY': JSON.stringify(process.env.PUBLIC_FIREBASE_API_KEY),
      'import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.PUBLIC_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(process.env.PUBLIC_FIREBASE_PROJECT_ID),
      'import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.PUBLIC_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.PUBLIC_FIREBASE_APP_ID': JSON.stringify(process.env.PUBLIC_FIREBASE_APP_ID),
      'import.meta.env.PUBLIC_GOOGLE_CLIENT_ID': JSON.stringify(process.env.PUBLIC_GOOGLE_CLIENT_ID),
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL),
      'import.meta.env.PUBLIC_ENVIRONMENT': JSON.stringify(process.env.PUBLIC_ENVIRONMENT || 'development'),
    },
  },
});

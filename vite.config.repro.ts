import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const stub = (name: string) =>
  path.resolve(__dirname, `src/utils/repro/${name}-stub.ts`);

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, './src/utils/codegenNativeComponentMock.ts'),
      'react-native': path.resolve(__dirname, 'src/utils/react-native-web-wrapper.ts'),
      'react-native-reanimated': stub('reanimated'),
      'expo-modules-core': stub('expo-modules-core'),
      'expo-haptics': stub('expo-haptics'),
      'expo-updates': stub('expo-updates'),
      'expo-application': stub('expo-application'),
      'expo-constants': stub('expo-constants'),
      'expo-file-system': stub('expo-file-system'),
      'expo-font': stub('expo-font'),
      'expo-status-bar': stub('expo-status-bar'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'buffer', 'react-native-svg', 'react-native-web'],
    esbuildOptions: { define: { global: 'globalThis' } },
  },
  server: { port: 5173, host: true },
});

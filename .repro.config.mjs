import { defineConfig } from 'vitest/config';
import path from 'path';

const repoRoot = '/Users/mymac/Antigravity/Velness/Velness';

const assetStub = {
  name: 'asset-stub',
  enforce: 'pre',
  transform(code) {
    // Stub runtime require() of image assets (React Native style).
    return code.replace(
      /require\(\s*(['"])([^'"]+\.(jpg|jpeg|png|gif|webp|svg|ttf|otf))\1\s*\)/g,
      '"asset-stub"'
    );
  },
};

export default defineConfig({
  plugins: [assetStub],
  esbuild: { jsx: 'automatic' },
  define: { __DEV__: 'false' },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['.repro.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, './src'),
      'backend': path.resolve(repoRoot, './backend'),
      'react-native': 'react-native-web',
      'react-native-reanimated': path.resolve(repoRoot, './.repro.reanimated-mock.mjs'),
      'lucide-react-native': path.resolve(repoRoot, './.repro.lucide-mock.ts'),
    },
  },
});

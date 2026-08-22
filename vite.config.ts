import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// Library build: emit ESM + UMD bundles with Vue externalised (the host app provides
// it), plus rolled-up type declarations. Nothing app-specific ships here.
export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NovatechInsightsUi',
      fileName: (format) => (format === 'es' ? 'insights-ui.js' : 'insights-ui.umd.cjs'),
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
        assetFileNames: (asset) => (asset.names?.[0]?.endsWith('.css') ? 'insights-ui.css' : 'assets/[name][extname]'),
      },
    },
  },
});

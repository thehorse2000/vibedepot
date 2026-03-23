import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@vibedepot/shared'] })],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '../packages/shared/src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@vibedepot/shared'] })],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
        '@shared': resolve(__dirname, '../packages/shared/src'),
      },
    },
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});

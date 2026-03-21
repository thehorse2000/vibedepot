import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  splitting: false,
  external: ['electron'],
  noExternal: ['@vibedepot/shared'],
});

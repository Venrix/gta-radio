import { defineConfig } from 'vite';
import ogPlugin from './vite-plugin-og.js';

export default defineConfig({
  base: '/',
  plugins: [ogPlugin()]
});

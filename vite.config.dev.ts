import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    port: 6006,
    open: '/playground/',
  },
  resolve: {
    alias: {
      'ffbox-ui': resolve(__dirname, 'src/ffbox-ui-autoregister.ts'),
    },
  },
});

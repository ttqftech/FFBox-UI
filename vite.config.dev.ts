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
    alias: [
      { find: 'ffbox-ui', replacement: resolve(__dirname, 'src/ffbox-ui-autoregister.ts') },
      { find: 'ffbox-tooltip', replacement: resolve(__dirname, 'src/components/tooltip/ffbox-tooltip.ts') },
      { find: 'ffbox-msgbox', replacement: resolve(__dirname, 'src/components/msgbox/ffbox-msgbox.ts') },
      { find: 'ffbox-popup', replacement: resolve(__dirname, 'src/components/popup/ffbox-popup.ts') },
      { find: 'ffbox-menu', replacement: resolve(__dirname, 'src/components/menu/ffbox-menu.ts') },
    ],
  },
});

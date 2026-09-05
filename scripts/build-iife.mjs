import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logMsg } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

logMsg('FFBox-UI IIFE 模块打包开始');

await build({
	root,
	logLevel: 'warn',
	build: {
		lib: {
			entry: resolve(root, 'src/ffbox-ui-autoregister.ts'),
			formats: ['iife'],
			name: 'FFBoxUI',
			fileName: () => 'ffbox-ui.iife.js',
		},
		outDir: resolve(root, 'dist/iife'),
		emptyOutDir: true,
		sourcemap: true,
		minify: false,
	},
});

logMsg('FFBox-UI IIFE 模块打包完成');

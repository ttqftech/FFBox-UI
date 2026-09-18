import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync } from 'fs';
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

// IIFE 产物没有模块导出，而是把 API 挂到全局 FFBoxUI，tsc 推导不出来，
// 因此手写一份全局声明放在产物旁。文件名必须与产物同名（.js -> .d.ts），
// 这样 exports 里 "./dist/iife/*" 的解析才能命中。
copyFileSync(
	resolve(root, 'types/iife-global.d.ts'),
	resolve(root, 'dist/iife/ffbox-ui.iife.d.ts')
);

logMsg('FFBox-UI IIFE 模块打包完成');

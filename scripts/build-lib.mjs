import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, stat, mkdir, copyFile, rm } from 'fs/promises';
import { logMsg } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const distDir = resolve(root, 'dist');
await rm(distDir, { recursive: true, force: true });

const componentDirs = await readdir(resolve(root, 'src/components'));

logMsg(`1. 打包 ${componentDirs.length} 个组件`);

for (const dir of componentDirs) {
	const dirPath = resolve(root, 'src/components', dir);
	const dirStat = await stat(dirPath);
	if (!dirStat.isDirectory()) continue;

	const files = await readdir(dirPath);
	const entryFile = files.find(f => f.endsWith('.ts') && f.startsWith('ffbox-'));
	if (!entryFile) continue;

	const entryPath = resolve(dirPath, entryFile);
	const outDir = resolve(root, 'dist/esm/components', dir);

	console.log(`  ${dir}/${entryFile}`);

	await build({
		root,
		logLevel: 'warn',
		build: {
			lib: {
				entry: entryPath,
				formats: ['es'],
				fileName: () => entryFile.replace('.ts', '.js'),
			},
			outDir,
			emptyOutDir: true,
			sourcemap: true,
			minify: false,
		},
	});
}

logMsg('2. 打包主 ESM 模块');

await build({
	root,
	logLevel: 'warn',
	build: {
		lib: {
			entry: resolve(root, 'src/ffbox-ui.ts'),
			formats: ['es'],
			fileName: () => 'ffbox-ui.js',
		},
		outDir: resolve(root, 'dist/esm'),
		emptyOutDir: false,
		sourcemap: true,
		minify: false,
	},
});

logMsg('3. 打包自动注册 ESM 模块');

await build({
	root,
	logLevel: 'warn',
	build: {
		lib: {
			entry: resolve(root, 'src/ffbox-ui-autoregister.ts'),
			formats: ['es'],
			fileName: () => 'ffbox-ui-autoregister.js',
		},
		outDir: resolve(root, 'dist/esm'),
		emptyOutDir: false,
		sourcemap: true,
		minify: false,
	},
});

logMsg('4. 复制主题文件');

const themesDir = resolve(root, 'dist/themes');
await mkdir(themesDir, { recursive: true });

for (const file of ['light.css', 'dark.css']) {
	await copyFile(
		resolve(root, 'src/themes', file),
		resolve(themesDir, file)
	);
}

logMsg('FFBox-UI ESM 打包完成');
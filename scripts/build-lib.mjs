import { build } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, stat, mkdir, copyFile, rm } from 'fs/promises';
import { logMsg } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const distDir = resolve(root, 'dist');
await rm(distDir, { recursive: true, force: true });

const componentDirs = await readdir(resolve(root, 'src/components'));

const entries = {};

logMsg(`收集组件入口`);

for (const dir of componentDirs) {
	const dirPath = resolve(root, 'src/components', dir);
	const dirStat = await stat(dirPath);
	if (!dirStat.isDirectory()) continue;

	const files = await readdir(dirPath);
	const entryFile = files.find(f => f.endsWith('.ts') && f.startsWith('ffbox-'));
	if (!entryFile) continue;

	const entryPath = resolve(dirPath, entryFile);
	entries[`components/${dir}/${entryFile.replace('.ts', '')}`] = entryPath;
	console.log(`  ${dir}/${entryFile}`);
}

entries['ffbox-ui'] = resolve(root, 'src/ffbox-ui.ts');
entries['ffbox-ui-autoregister'] = resolve(root, 'src/ffbox-ui-autoregister.ts');

logMsg(`打包 ESM 模块 (${Object.keys(entries).length} 个入口 + Lit 框架)`);

await build({
	root,
	logLevel: 'warn',
	// esbuild 不产出 .d.ts，靠这个插件在同一次构建里发射声明文件，
	// 输出结构镜像 src，与 dist/esm 下的 .js 一一对应
	plugins: [
		dts({
			tsconfigPath: './tsconfig.build.json',
			entryRoot: 'src',
			include: ['src'],
		}),
	],
	build: {
		lib: {
			entry: entries,
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`,
		},
		outDir: resolve(root, 'dist/esm'),
		emptyOutDir: true,
		sourcemap: true,
		minify: false,
		rollupOptions: {
			output: {
				// 默认 chunkFileNames 为 '[name]-[hash].js'，去掉 hash 让产物路径稳定可预测
				chunkFileNames: '[name].js',
				manualChunks(id) {
					// 如果索引到的模块的名称名包含 Lit，就指定这个模块打包到 lit chunk
					if (/node_modules[\\/](@?lit|@lit-labs)[\\/]/.test(id)) {
						return 'lit';
					}
					// utils / contexts 会被多个入口（各组件 + ffbox-ui + autoregister）共享。
					// 若不显式分流，Rollup 会按「入口集合」把它们和某个组件合并成共享 chunk，
					// 导致该组件的入口文件退化成转发壳、真实代码落到 outDir 根目录。
					if (/src[\\/]utils[\\/]/.test(id)) {
						return 'utils/ffbox-utils';
					}
					if (/src[\\/]contexts[\\/]/.test(id)) {
						return 'contexts/theme-context';
					}
				},
			},
		},
	},
});

logMsg('复制主题文件');

const themesDir = resolve(root, 'dist/themes');
await mkdir(themesDir, { recursive: true });

for (const file of ['light.css', 'dark.css']) {
	await copyFile(
		resolve(root, 'src/themes', file),
		resolve(themesDir, file)
	);
}

logMsg('FFBox-UI ESM 打包完成');
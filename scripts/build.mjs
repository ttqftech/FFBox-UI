import { exec } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logMsg } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

logMsg('FFBox-UI 打包开始');

const run = (cmd) => new Promise((res, rej) => {
	const proc = exec(cmd, { cwd: root }, (err, stdout, stderr) => {
		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);
		if (err) rej(err);
		else res();
	});
});

await run('node scripts/build-lib.mjs');
await run('node scripts/build-iife.mjs');

logMsg('FFBox-UI 打包完成!');

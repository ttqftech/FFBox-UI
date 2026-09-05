export function getTimeString(date, showMs = true) {
	return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')} ${(date.getHours() + '').padStart(2, '0')}:${(date.getMinutes() + '').padStart(2, '0')}:${(date.getSeconds() + '').padStart(2, '0')}${showMs ? '.' + (date.getMilliseconds() + '').padStart(3, '0') : ''}`;
}

export function logMsg(...content) {
	console.log(`\x1b[32m${getTimeString(new Date())}\x1b[0m`, ...content);
}
logMsg.error = function (...content) {
	console.error(`\x1b[31m${getTimeString(new Date())}\x1b[0m`, ...content);
}

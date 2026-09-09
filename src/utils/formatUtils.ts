/**
 * 时间格式化工具，由 src/common/formatUtils.ts 迁移而来。
 *
 * 组件库只用得到 parseTime（校验时间输入）与 formatTime（展示时长），
 * 因此只迁移这两个函数，其余（体积、码率、传输速率）未迁移。
 */

/**
 * 秒数 → 时间格式化
 * @param seconds 秒数（可带小数）
 * @param style 格式化风格，描述"用途"而非"实现"：
 *   - `'display'`: 人类可读，带精度信息 — `H:MM:SS / M:SS.c / s.cc`【TaskItem.graphTime、CutOperator 关键帧】
 *   - `'compact'`: 人类可读，紧凑 — `H:MM:SS / M:SS / "X s"`【TaskItem.graphLeftTime、ProgressLog X 轴、SponsorPanel 限制时长】
 *   - `'ffmpeg'` : 补零机器格式 — `HH:MM:SS.xx`（可直接作为 FFmpeg 参数）
 */
export function formatTime(seconds: number, style: 'display' | 'compact' | 'ffmpeg'): string {
	// NaN / -1 视作"未知时长"
	if (isNaN(seconds) || seconds === -1) {
		return '时长未知';
	}

	const hour = Math.floor(seconds / 3600);
	const minute = Math.floor((seconds - hour * 3600) / 60);
	const second = seconds - hour * 3600 - minute * 60;

	if (style === 'ffmpeg') {
		// HH:MM:SS.xx — 全程补零，2 位小数，FFmpeg 可直接解析
		return ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2) + ':' + ('0' + second.toFixed(2)).slice(-5);
	}

	// 以下为人类可读风格（不补零）
	if (hour) {
		return `${hour}:${minute.toString().padStart(2, '0')}:${second.toFixed(0).toString().padStart(2, '0')}`;
	} else if (minute) {
		if (style === 'compact') {
			return `${minute}:${second.toFixed(0).padStart(2, '0')}`;
		}
		return `${minute}:${second.toFixed(1).padStart(4, '0')}`;
	} else {
		if (style === 'compact') {
			return `${second.toFixed(0)} s`;
		}
		return second.toFixed(2);
	}
}

/**
 * 传入 ffmpeg 支持的时间格式（如 HH:MM:SS.xx 或 M:SS.xx 或 xxx.xx），返回秒数（如格式错误则返回 -1）
 */
export function parseTime(timeString: string): number {
	if (timeString === 'N/A') {
		return -1;
	}
	let exp: RegExpExecArray | null;
	if (exp = /^(\d+):([0-5]?[0-9]):([0-5]?[0-9])(.\d+)?$/.exec(timeString)) {
		// (时):(分):(秒)(.小)
		const hour = Number(exp[1]);
		const minute = Number(exp[2]);
		const second = Number(exp[3]);
		const mili = Number(exp[4] ?? '0');
		if (minute >= 60 || second >= 60) {
			return -1;
		}
		return hour * 3600 + minute * 60 + second + Number(mili);
	} else if (exp = /^([0-5]?[0-9]):([0-5]?[0-9])(.\d+)?$/.exec(timeString)) {
		// (分):(秒)(.小)
		const minute = Number(exp[1]);
		const second = Number(exp[2]);
		const mili = Number(exp[3] ?? '0');
		if (minute >= 60 || second >= 60) {
			return -1;
		}
		return minute * 60 + second + Number(mili);
	} else if (/^(\d+)(.\d+)?$/.test(timeString)) {
		// (秒)(.小)
		return Number(timeString);
	}
	return -1;
}

export default {
	time: formatTime,
	parseTime: parseTime,
};

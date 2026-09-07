import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-slider')
export class FFBoxSlider extends LitElement {
	static styles = css`
		:host {
			display: block;
		}

		.slider {
			position: relative;
			flex-grow: 1;
			height: 56px;
			display: flex;
			align-items: center;
		}

		.slider-module {
			position: relative;
			flex-grow: 1;
			height: 100%;
			margin: 0 16px;
			font-size: 14px;
		}

		.slider-module-track {
			position: absolute;
			top: 17px;
			width: 100%;
			height: 6px;
			border-radius: 8px;
			box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.15) inset;
		}

		.slider-module-track-background {
			position: absolute;
			top: 17px;
			height: 6px;
			background: #49e;
			border-radius: 8px;
			box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.15) inset;
			pointer-events: none;
		}

		.slider-module-slipper {
			position: absolute;
			top: 4px;
			transform: translateX(-50%);
			width: 18px;
			height: 30px;
			background: linear-gradient(180deg, #fefefe, #f0f0f0);
			border-radius: 4px;
			box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.2);
			border: none;
			outline: none;
		}

		.slider-module-slipper:hover {
			background: linear-gradient(180deg, #ffffff, #fefefe);
		}

		.slider-module-slipper:active {
			background: linear-gradient(180deg, #f0f0f0, #ededed);
		}

		.slider-module-mark {
			position: absolute;
			bottom: 0px;
			transform: translateX(-50%);
			width: max-content;
			font-size: 10px;
			text-align: center;
			opacity: 0.7;
			pointer-events: none;
		}

		.slider-module-mark::before {
			content: "";
			position: absolute;
			left: calc(50% - 2px);
			top: -8px;
			width: 4px;
			height: 4px;
			border-radius: 4px;
			box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2) inset;
			z-index: -10;
		}

		.slider-text {
			width: 88px;
			font-size: 14px;
			text-align: center;
		}

		:host([data-theme="light"]) .slider-module-track {
			background: #FFF;
		}
		:host([data-theme="light"]) .slider-module-mark::before {
			background: #FFF;
		}

		:host([data-theme="dark"]) .slider-module-track {
			background: #444;
		}
		:host([data-theme="dark"]) .slider-module-mark::before {
			background: #777;
		}
	`;

	private static _numberOrStringConverter = {
		fromAttribute(value: string | null): number | string | undefined {
			if (value === null) return undefined;
			const num = Number(value);
			return isNaN(num) ? value : num;
		},
		toAttribute(value: number | string | undefined): string | null {
			return value?.toString() ?? null;
		},
	};

	@property({ reflect: true, converter: FFBoxSlider._numberOrStringConverter }) value?: number | string;
	@property({ type: Number }) min = 0;
	@property({ type: Number }) max = 1;
	@property({ type: Number }) arrowKeyStep?: number;	// 键盘方向键，不指定时按整数进行调整，指定时按步长倒数进行调整
	@property() adsorption?: 'int' | 'tags' | ((value: number) => number);	// 鼠标或触屏调整时吸附值，不指定时自动选择 tags
	@property({ attribute: false }) tags?: [number, string][] | Map<number, string>;
	@property() mode?: 'number' | 'string';	// 决定了 onChange 返回时的值类型、tags 是否用于列表选项
	@property({ attribute: false }) valueToDisplay?: { base?: number, type?: 'bitrate' | 'integer' | 'revertInteger' } | ((value: number | string | undefined) => string);	// 仅在 mode 为 number 时有效，指定显示在滑块旁边的结果
	@property({ type: Boolean, attribute: false }) useIEC = false;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	private _tagsRef?: [number, string][] | Map<number, string>;
	private _sortedTagsCache?: [number, string][];
	private get _sortedTags(): [number, string][] | undefined {
		if (this._tagsRef !== this.tags) {
			this._tagsRef = this.tags;
			if (this.tags instanceof Map) {
				this._sortedTagsCache = [...this.tags.entries()].sort((a, b) => a[0] - b[0]);
			} else if (Array.isArray(this.tags)) {
				this._sortedTagsCache = [...this.tags].sort((a, b) => a[0] - b[0]);
			} else {
				this._sortedTagsCache = undefined;
			}
		}
		return this._sortedTagsCache;
	}

	private get _numericalValue(): number | undefined {
		if (typeof this.value === 'string') {
			if (this._sortedTags?.length) {
				const item = this._sortedTags.find((item) => item[1] === this.value);
				return item?.[0];
			}
			return undefined;
		} else {
			return this.value;
		}
	}

	private get _limitedValue(): number {
		if (typeof this._numericalValue === 'number') {
			return (this._numericalValue - this.min) / (this.max - this.min);
		}
		return 0;
	}

	private _valueToDisplayConverter(setting?: typeof this['valueToDisplay']): string {
		if (setting instanceof Function) {
			return setting(this.value);
		} else if (setting) {
			if (setting.type === 'bitrate') {
				const bps = Math.round((setting.base ?? 0) * 2 ** (this.value as number));
				if (this.useIEC) {
					if (bps >= 10 * 1024 ** 2) {
						return (bps / 1024 ** 2).toFixed(1) + ' Mibps';
					} else {
						return (bps / 1024).toFixed(0) + ' kibps';
					}
				} else {
					if (bps >= 10 * 1000 ** 2) {
						return (bps / 1000 ** 2).toFixed(1) + ' Mbps';
					} else {
						return (bps / 1000).toFixed(0) + ' Kbps';
					}
				}
			} else if (setting.type === 'integer') {
				return (this.value as number).toFixed(0);
			} else if (setting.type === 'revertInteger') {
				return (this.max - (this.value as number)).toFixed(0);
			} else {
				return String(this.value ?? '');
			}
		} else {
			if (this.mode === 'string') {
				if (this._sortedTags?.length) {
					const numVal = this._numericalValue;
					if (numVal !== undefined) {
						const item = this._sortedTags.find((item) => item[0] === numVal);
						if (item) return item[1];
					}
					const item = this._sortedTags.find((item) => item[1] === this.value);
					if (item) return item[1];
				}
			}
			return String(this.value ?? '');
		}
	}

	render() {
		const limitedPct = Math.max(0, this._limitedValue * 100);
		const slipperLeft = this._limitedValue * 100;

		return html`
			<div class="slider">
				<div class="slider-module" @mousedown=${this._handleDragStart} @touchstart=${this._handleDragStart}>
					<div class="slider-module-track"></div>
					<div class="slider-module-track-background" style="width: ${limitedPct}%"></div>
					${this._sortedTags?.map(([tagValue, tagLabel]) => {
						const left = (tagValue - this.min) / (this.max - this.min) * 100;
						return html`<span class="slider-module-mark" style="left: ${left}%">${tagLabel}</span>`;
					})}
					${this.value !== undefined ? html`
						<button
							class="slider-module-slipper"
							style="left: ${slipperLeft}%"
							@keydown=${this._handleKeydown}
							aria-label="滑块"
						></button>
					` : ''}
				</div>
				<div class="slider-text">${this._valueToDisplayConverter(this.valueToDisplay)}</div>
			</div>
		`;
	}

	private _emitNewValue(realValue: number) {
		const clamped = Math.max(this.min, Math.min(this.max, realValue));
		let emitValue: number | string | undefined;
		if (this.mode === 'string') {
			if (this._sortedTags?.length) {
				const item = this._sortedTags.find((item) => item[0] === clamped);
				emitValue = item?.[1] ?? clamped;
			} else {
				emitValue = clamped;
			}
		} else {
			emitValue = clamped;
		}
		this.value = emitValue;
		this.dispatchEvent(new CustomEvent('change', {
			detail: emitValue,
			bubbles: true,
			composed: true,
		}));
	}

	private _adsorb(realValue: number): number {
		if (this.adsorption === 'int') {
			return Math.round(realValue);
		} else if (this.adsorption === 'tags') {
			if (this._sortedTags?.length) {
				let minDist = Number.MAX_VALUE;
				let closest = realValue;
				for (const [tagValue] of this._sortedTags) {
					const dist = Math.abs(realValue - tagValue);
					if (dist <= minDist) {
						minDist = dist;
						closest = tagValue;
					}
				}
				return closest;
			}
			return realValue;
		} else if (typeof this.adsorption === 'function') {
			return this.adsorption(realValue);
		} else if (this.mode === 'string') {
			// 如果是字符串模式，吸附到 tags 上
			if (this._sortedTags?.length) {
				let minDist = Number.MAX_VALUE;
				let closest = realValue;
				for (const [tagValue] of this._sortedTags) {
					const dist = Math.abs(realValue - tagValue);
					if (dist <= minDist) {
						minDist = dist;
						closest = tagValue;
					}
				}
				return closest;
			}
			return realValue;
		} else if (this._sortedTags?.length) {
			const range = this.max - this.min;
			const threshold = 0.01 * range;	// 吸附阈值
			for (const [tagValue] of this._sortedTags) {
				if (Math.abs(tagValue - realValue) < threshold) {
					realValue = tagValue;
				}
			}
			return realValue;
		}
		return realValue;
	}

	private _handleDragStart(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const mouseDownX = (event as MouseEvent).pageX ?? (event as TouchEvent).touches[0].pageX;
		const target = event.target as HTMLElement;
		let sliderLeft: number, sliderWidth: number, slipperOffsetX: number;

		const isSlipper = target.classList.contains('slider-module-slipper');
		if (isSlipper) {
			sliderLeft = target.parentElement!.getBoundingClientRect().left;
			sliderWidth = target.parentElement!.offsetWidth;
			slipperOffsetX = (event as MouseEvent).offsetX - target.offsetWidth / 2;
			target.focus();
		} else {
			sliderLeft = target.getBoundingClientRect().left;
			sliderWidth = target.offsetWidth;
			slipperOffsetX = 0;
		}

		let lastValue = NaN;

		const handleMouseMove = (e: MouseEvent | TouchEvent) => {
			const pageX = (e as MouseEvent).pageX ?? (e as TouchEvent).touches?.[0]?.pageX ?? mouseDownX;
			let limitedValue = (Math.floor(pageX) - sliderLeft - slipperOffsetX) / sliderWidth;
			limitedValue = Math.max(0, Math.min(1, limitedValue));
			const range = this.max - this.min;
			let realValue = this.min + range * limitedValue;
			realValue = range <= 1 ? Number(realValue.toFixed(6)) : Number(realValue.toFixed(3));	// 限制最长小数点后数量，因为用不上
			realValue = this._adsorb(realValue);
			if (realValue !== lastValue) {
				this._emitNewValue(realValue);
				lastValue = realValue;
			}
		};

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleMouseMove);
			document.removeEventListener('touchend', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('touchmove', handleMouseMove);
		document.addEventListener('touchend', handleMouseUp);
		handleMouseMove({ pageX: mouseDownX } as MouseEvent);	// mouseDown 直接触发 mouseMove
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			const direction = event.key === 'ArrowLeft' ? -1 : 1;
			const originalValue = this._numericalValue ?? (this.max + this.min) / 2;
			const range = this.max - this.min;
			const delta = this.arrowKeyStep ? range / this.arrowKeyStep : 1;
			let newRealValue = Number((originalValue + direction * delta).toFixed(6));
			newRealValue = Math.max(this.min, Math.min(this.max, newRealValue));
			this._emitNewValue(newRealValue);
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-slider': FFBoxSlider;
	}
}

import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-switch')
export class FFBoxSwitch extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		// :host([data-theme="dark"]) {
		// 	outline: red 1px solid;	// 测试 theme 响应
		// }
	
		.switch-track {
			position: relative;
			height: 24px;
			width: 88px;
			border-radius: 24px;
			background: var(--f7, #F7F7F7);
			border: #CCC 1px solid;
			box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1) inset;
			cursor: pointer;
			user-select: none;
		}

		.switch-track-background {
			position: absolute;
			height: 24px;
			border-radius: 24px;
			background: hsl(210, 85%, 60%);
			box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1) inset;
			transition: all 0.15s ease-out;
		}

		.switch-slipper {
			position: absolute;
			top: 0;
			height: 24px;
			width: 24px;
			border-radius: 50%;
			background: linear-gradient(180deg, #fefefe, #f0f0f0);
			box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.3);
			transform: scale(1.25);
			transition: all 0.15s ease-out;
			border: none;
			outline: none;
			cursor: pointer;
		}

		.switch-slipper:hover {
			background: linear-gradient(180deg, #ffffff, #fefefe);
		}

		.switch-slipper:active {
			background: linear-gradient(180deg, #f0f0f0, #ededed);
		}
	`;

	@property({ type: Boolean, reflect: true }) checked = false;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@query('.switch-slipper') private slipperEl!: HTMLElement;

	render() {
		return html`
			<div class="switch-track" @mousedown=${this._handleDragStart} @touchstart=${this._handleDragStart}>
				<div
					class="switch-track-background"
					style="width: ${this.checked ? '100%' : '0%'}"
				></div>
				<button
					class="switch-slipper"
					style="left: ${this.checked ? '64px' : '0px'}"
					@keydown=${this._handleKeydown}
					@keyup=${this._handleKeyup}
					aria-label="开关"
					role="switch"
					aria-checked=${this.checked}
				></button>
			</div>
		`;
	}

	private _handleDragStart(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const beforeChecked = this.checked;
		const mouseDownX = (event as MouseEvent).pageX ?? (event as TouchEvent).touches[0].pageX;
		let sliderLeft: number, sliderWidth: number;

		const target = event.target as HTMLElement;
		if (target === this.slipperEl) {
			sliderLeft = target.parentElement!.getBoundingClientRect().left;
			sliderWidth = target.parentElement!.offsetWidth;
		} else {
			sliderLeft = target.getBoundingClientRect().left;
			sliderWidth = target.offsetWidth;
		}

		let lastValue: boolean | number = NaN;

		const handleMouseMove = (e: MouseEvent | TouchEvent) => {
			const pageX = (e as MouseEvent).pageX ?? (e as TouchEvent).touches?.[0]?.pageX ?? mouseDownX;
			let valueX = Math.floor(pageX) - sliderLeft;
			let newValue: boolean;
			if (valueX < sliderWidth / 2) {
				newValue = false;
			} else {
				newValue = true;
			}
			if (newValue !== lastValue) {
				this._emitChange(newValue);
				lastValue = newValue;
			}
		};

		const handleMouseUp = (e: MouseEvent | TouchEvent) => {
			const pageX = (e as MouseEvent).pageX ?? (e as TouchEvent).changedTouches?.[0]?.pageX ?? mouseDownX;
			if (Math.abs(mouseDownX - Math.floor(pageX)) <= 3) {
				if (this.checked && beforeChecked) {
					this._emitChange(false);
				} else if (!this.checked && !beforeChecked) {
					this._emitChange(true);
				}
			}
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleMouseMove);
			document.removeEventListener('touchend', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('touchmove', handleMouseMove);
		document.addEventListener('touchend', handleMouseUp);
		handleMouseMove({ pageX: mouseDownX } as MouseEvent);
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			this._emitChange(false);
		} else if (event.key === 'ArrowRight') {
			this._emitChange(true);
		}
	}

	private _handleKeyup(event: KeyboardEvent) {
		if (event.key === ' ' || event.key === 'Enter') {
			this._emitChange(!this.checked);
		}
	}

	private _emitChange(value: boolean) {
		// const old = this.checked;
		this.checked = value;
		this.dispatchEvent(new CustomEvent('change', {
			detail: value,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-switch': FFBoxSwitch;
	}
}

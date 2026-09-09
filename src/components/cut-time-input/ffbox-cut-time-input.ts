import '../theme-provider/ffbox-theme-provider.js';
import '../button/ffbox-button.js';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import { durationFixer, durationValidator } from '../../utils/validatorAndFixer.js';

export type CutTimeValue = [string | undefined, string | undefined];

@customElement('ffbox-cut-time-input')
export class FFBoxCutTimeInput extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		.inputbox-selector {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 6px;
			height: 24px;
			flex-grow: 1;
			margin: 15px 0;
		}

		.inputbox-selector:hover .inputbox-selectorBackground-wrapper > div {
			background: var(--ff);
		}

		.inputbox-selectorBackground-wrapper {
			position: absolute;
			top: -4px;
			left: -8px;
			width: calc(100% + 16px);
			height: calc(100% + 16px);
			-webkit-mask-image: linear-gradient(to right, black calc(50% - 34px), #0003 calc(50% - 18px), #0003 calc(50% + 18px), black calc(50% + 34px));
			z-index: -1;
		}

		.inputbox-selectorBackground-wrapper > div {
			position: absolute;
			top: 3px;	/* border 有 1px 往下顶，所以这里减去 1px */
			left: 8px;
			width: calc(100% - 16px);
			height: calc(100% - 16px);
			border-radius: 24px;
			background: var(--f7);
			border: #AAA 1px solid;
			box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
			transition: box-shadow 0.2s linear, border 0.2s linear;
		}

		.inputbox-selector > input {
			width: calc(50% - 28px - 12px);
			height: 24px;
			line-height: 24px;
			background: none;
			border: none;
			margin: 0;
			padding: 0;
			outline: none;
			font-family: inherit;
			font-size: 13px;
			text-align: center;
			color: inherit;
		}

		.inputbox-selector > input::placeholder {
			font-size: 13px;
			opacity: 0.1;
			font-style: italic;
			transition: opacity 0.15s linear;
		}

		.inputbox-selector > input:hover::placeholder {
			font-size: 13px;
			opacity: 0.25;
		}

		.opButton {
			position: relative;
			display: flex;
			align-items: center;
		}

		.opButton ffbox-button {
			width: 60px; /* TODO: 由于 Shadow DOM 机制，此设定失效 */
		}

		.opButton:hover .hiddenButton {
			height: calc(24px + 24px);
			transform: translateY(-24px);
			opacity: 1;
			pointer-events: auto;
			/* outline: red 1px solid; */
			transition: transform 0.4s cubic-bezier(0.2, 1.5, 0.3, 1);
		}

		.hiddenButton {
			position: absolute;
			top: 0;
			left: 0;
			height: 24px;
			opacity: 0;
			/* 原版未处理：opacity 为 0 时仍会拦截点击，此处补充 pointer-events */
			pointer-events: none;
			transition: transform 0.4s, opacity 0.1s;
		}
	`;

	@property({ attribute: false }) value: CutTimeValue = [undefined, undefined];
	@property({ type: Boolean, reflect: true }) disabled = false;
	@property({ attribute: false }) placeholder?: [string, string];
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _inputText: CutTimeValue = [undefined, undefined];
	@state() private _focused: [boolean, boolean] = [false, false];

	/** 两个输入框任一校验不通过时的提示文本 */
	private get _invalidMsg(): string | undefined {
		return durationValidator(this._inputText[0] ?? '') || durationValidator(this._inputText[1] ?? '');
	}

	private get _selectorStyle(): Record<string, string> {
		const ret: Record<string, string> = {};
		// 校验有误的情况下背景和边框都变红
		if (this._invalidMsg) {
			ret.border = 'var(--errorBorder) 1px solid';
			ret.boxShadow = '0 0 12px hsla(0, 100%, 60%, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.05)';
			if (this._focused[0] || this._focused[1]) {
				ret.background = 'var(--errorBgActive)';
			} else {
				ret.background = 'var(--errorBg)';
			}
		} else {
			if (this._focused[0] || this._focused[1]) {
				ret.background = 'var(--ff)';
			}
		}
		// 禁用的情况下整体变透明，并且固定背景颜色
		if (this.disabled) {
			ret.opacity = '0.6';
			ret.color = 'var(--66)';	// 默认，20% 亮度黑色，变灰 40% 亮度黑色
			ret.background = 'var(--f7)';
		}
		return ret;
	}

	// 监听 value，并在其更新时依此更新内部 inputText（与输入框双向绑定）
	willUpdate(changed: Map<string, unknown>) {
		if (changed.has('value')) {
			const [from, to] = this.value ?? [undefined, undefined];
			if (this._inputText[0] !== from || this._inputText[1] !== to) {
				this._inputText = [from, to];
			}
		}
	}

	render() {
		return html`
			<div class="inputbox-selector">
				<div class="inputbox-selectorBackground-wrapper">
					<div style=${styleMap(this._selectorStyle)}></div>
				</div>
				<input
					?disabled=${this.disabled}
					.value=${this._inputText[0] ?? ''}
					.placeholder=${this.placeholder?.[0] ?? ''}
					@blur=${() => this._handleBlur(0)}
					@focus=${() => this._handleFocus(0)}
					@input=${(e: Event) => this._handleInput(e, 0)}
					@keydown=${this._handleKeydown}
				>
				<div class="opButton">
					<div class="hiddenButton">
						<ffbox-button size="small" type="danger" @click=${this._handleClear}>清空</ffbox-button>
					</div>
					<ffbox-button size="small" @click=${this._handleButtonClick}>编✂️辑</ffbox-button>
				</div>
				<input
					?disabled=${this.disabled}
					.value=${this._inputText[1] ?? ''}
					.placeholder=${this.placeholder?.[1] ?? ''}
					@blur=${() => this._handleBlur(1)}
					@focus=${() => this._handleFocus(1)}
					@input=${(e: Event) => this._handleInput(e, 1)}
					@keydown=${this._handleKeydown}
				>
			</div>
		`;
	}

	private _handleBlur(index: number) {
		this._focused = index === 0 ? [false, this._focused[1]] : [this._focused[0], false];
	}

	private _handleFocus(index: number) {
		// event.target!.selectionEnd = event.target!.selectionStart;
		this._focused = index === 0 ? [true, this._focused[1]] : [this._focused[0], true];
	}

	private _handleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const fixed = durationFixer(input.value);
		const newValue: CutTimeValue = [this._inputText[0], this._inputText[1]];
		newValue[index] = fixed;
		this._inputText = newValue;
		if (input.value !== fixed) {
			// 输入框中残留的非法字符需回填清理
			input.value = fixed;
		}
		this.value = newValue;
		// 使用输入法时会出现 inputText 为空的现象
		this._emitChange();
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.dispatchEvent(new CustomEvent('enter', { bubbles: true, composed: true }));
		}
	}

	private _handleClear(e: Event) {
		e.stopImmediatePropagation();
		this._inputText = ['', ''];
		this.value = ['', ''];
		this._emitChange();
	}

	private _handleButtonClick(e: Event) {
		e.stopImmediatePropagation();
		this.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
	}

	private _emitChange() {
		this.dispatchEvent(new CustomEvent('change', {
			detail: [this._inputText[0], this._inputText[1]] as CutTimeValue,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-cut-time-input': FFBoxCutTimeInput;
	}
}

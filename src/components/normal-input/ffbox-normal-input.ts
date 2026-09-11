import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-normal-input')
export class FFBoxNormalInput extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		.inputbox-selector {
			position: relative;
			height: 24px;
			flex-grow: 1;
			margin: 15px 0;
			border-radius: 24px;
			background: var(--f7);
			border: #AAA 1px solid;
			box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
			transition: box-shadow 0.2s linear, border 0.2s linear;
		}

		.inputbox-selector:hover {
			background: var(--ff);
		}

		// 这个其实会被 .focused 覆盖，Vue 那边一直有这个问题，而且是通过 style 而不是 class 控制的，代码上没这边好懂
		.inputbox-selector:active {
			background: var(--e7);
		}

		.inputbox-selector.focused {
			background: var(--ff);
		}

		.inputbox-selector.invalid {
			border: var(--errorBorder) 1px solid;
			box-shadow: 0 0 12px hsla(0, 100%, 60%, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.05);
		}

		.inputbox-selector.invalid.focused {
			background: var(--errorBgActive);
		}

		.inputbox-selector.invalid:not(.focused) {
			background: var(--errorBg);
		}

		:host([disabled]) .inputbox-selector {
			opacity: 0.6;
			color: var(--66);
			background: var(--f7);
		}

		.inputbox-selector input {
			position: absolute;
			left: 6px;
			width: calc(100% - 12px);
			height: 24px;
			line-height: 24px;
			background: none;
			border: none;
			margin: 0;
			padding: 0;
			outline: none;
			font-family: inherit;
			font-size: 13px;
			color: inherit;
		}

		.inputbox-selector input::placeholder {
			font-size: 13px;
			opacity: 0.1;
			font-style: italic;
			transition: opacity 0.15s linear;
		}

		.inputbox-selector input:hover::placeholder {
			font-size: 13px;
			opacity: 0.25;
		}
	`;

	@property({ reflect: true }) value = '';
	@property({ reflect: true }) type: 'text' | 'password' = 'text';
	@property({ type: Boolean, reflect: true }) disabled = false;
	@property() placeholder = '';
	@property({ attribute: false }) validator?: (value: string) => string | undefined;
	@property({ attribute: false }) inputFixer?: (value: string) => string;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	private _focused = false;
	private _invalidMsg?: string;

	willUpdate(changed: PropertyValues) {
		if (changed.has('value') || changed.has('validator')) {
			this._validate(this.value);
		}
	}

	render() {
		const classes = ['inputbox-selector'];
		if (this._focused) classes.push('focused');
		if (this._invalidMsg) classes.push('invalid');

		return html`
			<div class=${classes.join(' ')}>
				<input
					.type=${this.type}
					?disabled=${this.disabled}
					.value=${this.value}
					.placeholder=${this.placeholder}
					@blur=${this._handleBlur}
					@focus=${this._handleFocus}
					@input=${this._handleInput}
					@keydown=${this._handleKeydown}
				/>
			</div>
		`;
	}

	private _handleBlur() {
		this._focused = false;
		this.requestUpdate();
	}

	private _handleFocus(e: FocusEvent) {
		const input = e.target as HTMLInputElement;
		input.selectionEnd = input.selectionStart;
		this._focused = true;
		this.requestUpdate();
	}

	private _handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		let newValue = input.value;
		if (this.inputFixer) {
			newValue = this.inputFixer(newValue);
		}
		this.value = newValue;
		this._validate(newValue);
		e.stopPropagation();
		this.dispatchEvent(new CustomEvent('change', {
			detail: newValue,
			bubbles: true,
			composed: true,
		}));
	}

	private _handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			this.dispatchEvent(new CustomEvent('enter', {
				bubbles: true,
				composed: true,
			}));
		}
	}

	private _validate(value: string) {
		if (this.validator) {
			this._invalidMsg = this.validator(value);
		} else {
			this._invalidMsg = undefined;
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-normal-input': FFBoxNormalInput;
	}
}

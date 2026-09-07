import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-input-auto-size')
export class FFBoxInputAutoSize extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		.hidden-div {
			display: inline-block;
			position: fixed;
			visibility: hidden;
			font-size: inherit;
		}

		input {
			font-size: inherit;
			font-family: inherit;
		}
	`;

	@property({ reflect: true }) value = '';
	@property({ type: Boolean, attribute: 'focus-on-mounted' }) focusOnMounted = false;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@query('input') private _inputEl!: HTMLInputElement;
	@query('.hidden-div') private _hiddenDivEl!: HTMLDivElement;

	private _resizeObserver?: ResizeObserver;
	private _inputWidth = 8;

	connectedCallback() {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => {
			this._refreshSize();
		});
	}

	firstUpdated() {
		if (this._hiddenDivEl && this._resizeObserver) {
			this._resizeObserver.observe(this._hiddenDivEl);
			this._hiddenDivEl.style.fontFamily = getComputedStyle(this._inputEl).fontFamily;
		}
		if (this.focusOnMounted && this._inputEl) {
			this._inputEl.focus();
		}
	}

	disconnectedCallback() {
		this._resizeObserver?.disconnect();
		super.disconnectedCallback();
	}

	private _refreshSize() {
		const rect = this._hiddenDivEl?.getBoundingClientRect();
		if (rect) {
			this._inputWidth = Math.max(8, rect.width);
			this.requestUpdate();
		}
	}

	render() {
		return html`
			<div>
				<input
					type="text"
					.value=${this.value}
					style=${`width: ${this._inputWidth}px`}
					@keydown=${this._handleKeydown}
					@input=${this._handleInput}
					@blur=${this._handleBlur}
					@change=${this._handleChange}
				/>
				<div class="hidden-div">${this.value}</div>
			</div>
		`;
	}

	private _handleInput(e: Event) {
		// 事件会自动穿透 Shadow DOM 冒泡到外部
		this.value = (e.target as HTMLInputElement).value;
	}

	private _handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			this.dispatchEvent(new CustomEvent('press-enter', {
				detail: this.value,
				bubbles: true,
				composed: true,
			}));
		}
		// 事件会自动穿透 Shadow DOM 冒泡到外部
	}

	private _handleBlur() {
		this.dispatchEvent(new CustomEvent('blur', {
			detail: this.value,
			bubbles: true,
			composed: true,
		}));
	}

	private _handleChange() {
		this.dispatchEvent(new CustomEvent('change', {
			detail: this.value,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-input-auto-size': FFBoxInputAutoSize;
	}
}

import '../theme-provider/ffbox-theme-provider.js';
import '../checkbox/ffbox-checkbox.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-control-box')
export class FFBoxControlBox extends LitElement {
	static styles = css`
		:host {
			display: block;
			width: 210px;
			margin: 4px 20px;
			margin-right: 28px;
		}
		:host([long]) {
			width: 100%;
		}
		:host(:not([long])[optional]),
		:host([long]:not([optional])) {
			margin-right: 20px;
		}
		:host([long][optional]) {
			margin-right: 8px;
		}

		.controlBox {
			height: 56px;
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 4px;
		}

		.controlBox-title {
			min-width: 88px;
			font-size: 14px;
			text-align: center;
		}

		:host([optional]:not([has-value])) .controlBox-title {
			opacity: 0.5;
		}
	`;

	@property({ reflect: true }) title = '';
	@property({ reflect: true }) description = '';
	@property({ type: Boolean, reflect: true }) long = false;
	@property({ type: Boolean, reflect: true }) optional = false;
	@property({ type: Boolean, reflect: true, attribute: 'has-value' }) hasValue = false;	// Checkbox 状态
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	render() {
		return html`
			<div class="controlBox">
				${this.optional
					? html`<ffbox-checkbox
						.checked=${this.hasValue}
						@change=${this._handleCheckboxChange}
					></ffbox-checkbox>`
					: ''}
				<div
					class="controlBox-title"
					title=${this.description}
				>
					${this.title}
				</div>
				<slot></slot>
			</div>
		`;
	}

	private _handleCheckboxChange(e: CustomEvent) {
		this.hasValue = e.detail;
		this.dispatchEvent(new CustomEvent('enabledChange', {
			detail: e.detail,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-control-box': FFBoxControlBox;
	}
}

import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import checkIcon from './check.svg?raw';

@customElement('ffbox-checkbox')
export class FFBoxCheckbox extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		// :host([data-theme="dark"]) {
		// 	outline: red 1px solid;	// 测试 theme 响应
		// }

		.box {
			position: relative;
			box-sizing: border-box;
			width: 18px;
			height: 18px;
			display: inline-block;
			background-color: hwb(var(--bg98) / 0.8);
			border: hwb(0 80% 20%) 1px solid;
			border-radius: 3px;
			box-shadow: 0 2px 2px hwb(0 80% 20% / 0.2);
		}

		:host([disabled]) .box {
			cursor: not-allowed;
		}

		.box svg {
			position: absolute;
			left: 10%;
			top: 10%;
			width: 80%;
			height: 80%;
			color: transparent;
		}

		.boxSelected {
			background-color: hwb(220 25% 10%);
			border: none;
			box-shadow: 0 2px 4px hwb(220 25% 10% / 0.2);
		}

		.boxSelected svg {
			color: #FFF;
		}
	`;

	@property({
		reflect: true,
		converter: {
			fromAttribute: (value: string | null) => {
				if (value === null || value === 'false') return false;
				if (value === '' || value === 'true') return true;
				return value;
			},
			toAttribute: (value: boolean | 'partial') => {
				if (value === false) return null;
				if (value === true) return '';
				return value;
			},
		},
	}) checked: boolean | 'partial' = false;
	@property({ type: Boolean, reflect: true }) disabled = false;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	render() {
		const isSelected = this.checked === true || this.checked === 'partial';
		return html`
			<div
				class=${['box', isSelected ? 'boxSelected' : ''].filter(Boolean).join(' ')}
				@click=${this._handleClick}
				style="cursor: ${this.disabled ? 'not-allowed' : 'pointer'}"
			>
				${unsafeSVG(checkIcon)}
			</div>
		`;
	}

	private _handleClick() {
		if (this.disabled) return;
		const newValue = this.checked === true ? false : true;
		this.checked = newValue;
		this.dispatchEvent(new CustomEvent('change', {
			detail: newValue,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-checkbox': FFBoxCheckbox;
	}
}

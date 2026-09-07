import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

@customElement('ffbox-radio')
export class FFBoxRadio extends LitElement {
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
			width: 20px;
			height: 20px;
			display: inline-block;
			background-color: hwb(var(--bg98) / 0.8);
			border: hwb(0 80% 20%) 1px solid;
			border-radius: 10px;
			box-shadow: 0 2px 2px hwb(0 80% 20% / 0.2);
		}

		:host([disabled]) .box {
			cursor: not-allowed;
		}

		.round {
			position: absolute;
			left: 5px;
			top: 5px;
			width: 10px;
			height: 10px;
			border-radius: 5px;
			background-color: transparent;
		}

		.boxSelected {
			background-color: hwb(220 25% 10%);
			border: none;
			box-shadow: 0 2px 4px hwb(220 25% 10% / 0.2);
		}

		.boxSelected .round {
			background-color: #FFF;
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
				<div class="round"></div>
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
		'ffbox-radio': FFBoxRadio;
	}
}

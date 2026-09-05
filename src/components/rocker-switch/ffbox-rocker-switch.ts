import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ffbox-rocker-switch')
export class FFBoxRockerSwitch extends LitElement {
	static styles = css`
		:host {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			isolation: isolate;
			opacity: 0.7;
		}

		.rockerSwitch {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			isolation: isolate;
			opacity: 0.7;
		}

		.buttonWrapper {
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: stretch;
			z-index: -1;
			-webkit-mask-image: linear-gradient(to right, black 25%, transparent 50%, black 75%);
		}

		.arrow {
			flex: 1 1 auto;
			margin: 0 4px;
			border: none;
			background: none;
			color: inherit;
			border-radius: 4px;
			line-height: 1;
			cursor: pointer;
			font-family: inherit;
		}

		.arrow:hover:not(:disabled) {
			background-color: hwb(var(--bg99, 0 99% 1%) / 0.4);
			box-shadow:
				0 1px 4px hwb(var(--hoverShadow, 0 0% 100%) / 0.2),
				0 4px 2px -2px hwb(var(--highlight, 0 100% 0%) / 0.5) inset;
		}

		.arrow:active:not(:disabled) {
			box-shadow:
				0 0px 1px hwb(var(--hoverShadow, 0 0% 100%) / 0.2),
				0 20px 15px -10px hwb(var(--hoverShadow, 0 0% 100%) / 0.15) inset;
			transform: translateY(0.25px);
		}

		.arrow:disabled {
			opacity: 0.3;
			cursor: default;
		}

		.arrowLeft { text-align: left; }
		.arrowRight { text-align: right; }

		.label {
			pointer-events: none;
		}

		/* Size: s */
		:host([size="s"]) .rockerSwitch { height: 30px; }
		:host([size="s"]) .arrow { height: 22px; font-size: 12px; }
		:host([size="s"]) .label { font-size: 12px; padding: 0 26px; }

		/* Size: m */
		:host([size="m"]) .rockerSwitch { height: 35px; }
		:host([size="m"]) .arrow { height: 26px; font-size: 13.5px; }
		:host([size="m"]) .label { font-size: 13.5px; padding: 0 30px; }
	`;

	@property({ reflect: true }) size: 's' | 'm' = 's';
	@property({ type: Boolean, attribute: 'disabled-left' }) disabledLeft = false;
	@property({ type: Boolean, attribute: 'disabled-right' }) disabledRight = false;
	@property({ reflect: true, attribute: 'data-theme' }) theme: 'light' | 'dark' = 'light';

	render() {
		return html`
			<div class="rockerSwitch">
				<div class="buttonWrapper">
					<button class="arrow arrowLeft" ?disabled=${this.disabledLeft} @click=${this._goLeft}>&#9664;</button>
					<button class="arrow arrowRight" ?disabled=${this.disabledRight} @click=${this._goRight}>&#9654;</button>
				</div>
				<span class="label"><slot></slot></span>
			</div>
		`;
	}

	private _goLeft() {
		if (this.disabledLeft) return;
		this.dispatchEvent(new CustomEvent('ffbox-left', { bubbles: true, composed: true }));
	}

	private _goRight() {
		if (this.disabledRight) return;
		this.dispatchEvent(new CustomEvent('ffbox-right', { bubbles: true, composed: true }));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-rocker-switch': FFBoxRockerSwitch;
	}
}

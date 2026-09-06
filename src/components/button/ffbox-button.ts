import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

export type ButtonType = 'normal' | 'primary' | 'danger' | 'noBg';
export type ButtonSize = 'small' | 'normal' | 'large';

@customElement('ffbox-button')
export class FFBoxButton extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
			font-family: inherit;
		}

		:host([disabled]) .button {
			pointer-events: none;
			opacity: 0.6;
		}

		.button {
			position: relative;
			min-width: 100px;
			height: 28px;
			padding: 0 12px;
			line-height: 100%;
			font-size: 14px;
			text-align: center;
			background: linear-gradient(180deg, hwb(var(--bg99)), hwb(var(--bg94)));
			color: var(--33);
			font-family: inherit;
			border-radius: 8px;
			border: none;
			outline: none;
			cursor: pointer;
			transition: box-shadow 0.3s cubic-bezier(0, 1.5, 0.3, 1);
		}

		.button:active {
			transition: none;
			transform: translateY(0.5px);
		}

		/* Light theme */
		:host([data-theme="light"]) .button {
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99)),
				0 1px 3px 0 hwb(var(--hoverShadow) / 0.3);
		}
		:host([data-theme="light"]) .button:hover {
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 99% 1%)),
				0 0 0 0.5px hwb(var(--highlight, 0 100% 0%)) inset,
				0 1px 4px 0 hwb(var(--hoverShadow, 0 0% 100%) / 0.4);
		}
		:host([data-theme="light"]) .button:active {
			box-shadow:
				0 0px 2px 0.5px hwb(var(--hoverShadow, 0 0% 100%) / 0.15),
				0 8px 12px hwb(var(--hoverShadow, 0 0% 100%) / 0.1) inset;
		}

		/* Dark theme */
		:host([data-theme="dark"]) .button {
			/* outline: red 1px solid;	// 测试 theme 响应 */
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 18.5% 81.5%)),
				0 0 0 0.5px hwb(var(--highlight, 0 25% 75%) / 0.5) inset,
				0 1px 3px 0 hwb(var(--hoverShadow, 0 0% 100%) / 0.3);
		}
		:host([data-theme="dark"]) .button:hover {
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 18.5% 81.5%)),
				0 0 0 0.75px hwb(var(--highlight, 0 25% 75%)) inset,
				0 1px 4px 0 hwb(var(--hoverShadow, 0 0% 100%) / 0.4);
		}
		:host([data-theme="dark"]) .button:active {
			box-shadow:
				0 0px 2px 0.5px hwb(var(--hoverShadow, 0 0% 100%) / 0.15),
				0 8px 12px hwb(var(--hoverShadow, 0 0% 100%) / 0.4) inset;
		}

		/* Sizes */
		.small {
			height: 24px;
			font-size: 13px;
			padding: 0 8px;
			min-width: unset;
		}
		.large {
			height: 36px;
			font-size: 16px;
			padding: 0 20px;
			min-width: 160px;
			border-radius: 10px;
			text-indent: 1px;
			letter-spacing: 2px;
		}

		/* Primary - Light */
		:host(:not([data-theme="dark"])) .primary {
			background: linear-gradient(180deg, hwb(210 45% 5%), hwb(210 25% 10%));
			color: #FDFDFD;
		}
		:host(:not([data-theme="dark"])) .primary:hover {
			background: linear-gradient(180deg, hwb(210 45% 0%), hwb(210 25% 5%));
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 99% 1%)),
				0 0 0 0.5px hwb(210 50% 0%) inset,
				0 1px 4px 0 hwb(210 0% 50% / 0.4);
		}
		:host(:not([data-theme="dark"])) .primary:active {
			box-shadow:
				0 0px 2px 0.5px hwb(210 0% 100% / 0.15),
				0 4px 6px hwb(210 0% 100% / 0.2) inset;
		}

		/* Primary - Dark */
		:host([data-theme="dark"]) .primary {
			background: linear-gradient(180deg, hwb(210 30% 5%), hwb(210 15% 25%));
			color: #FDFDFD;
		}
		:host([data-theme="dark"]) .primary:hover {
			background: linear-gradient(180deg, hwb(210 30% 0%), hwb(210 15% 20%));
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 18.5% 81.5%)),
				0 0 0 0.5px hwb(210 50% 0%) inset,
				0 1px 4px 0 hwb(210 0% 50% / 0.4);
		}
		:host([data-theme="dark"]) .primary:active {
			box-shadow:
				0 0px 2px 0.5px hwb(210 0% 100% / 0.15),
				0 4px 6px hwb(210 0% 100% / 0.2) inset;
		}

		/* Danger - Light */
		:host(:not([data-theme="dark"])) .danger {
			background: linear-gradient(180deg, hwb(0 45% 5%), hwb(0 25% 10%));
			color: #FDFDFD;
		}
		:host(:not([data-theme="dark"])) .danger:hover {
			background: linear-gradient(180deg, hwb(0 45% 0%), hwb(0 25% 5%));
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 99% 1%)),
				0 0 0 0.5px hwb(0 50% 0%) inset,
				0 1px 4px 0 hwb(0 0% 50% / 0.4);
		}
		:host(:not([data-theme="dark"])) .danger:active {
			box-shadow:
				0 0px 2px 0.5px hwb(0 0% 100% / 0.15),
				0 4px 6px hwb(0 0% 100% / 0.2) inset;
		}

		/* Danger - Dark */
		:host([data-theme="dark"]) .danger {
			background: linear-gradient(180deg, hwb(0 30% 5%), hwb(0 15% 25%));
			color: #FDFDFD;
		}
		:host([data-theme="dark"]) .danger:hover {
			background: linear-gradient(180deg, hwb(0 30% 0%), hwb(0 15% 20%));
			box-shadow:
				0 0 1px 0.5px hwb(var(--bg99, 0 18.5% 81.5%)),
				0 0 0 0.5px hwb(0 50% 0%) inset,
				0 1px 4px 0 hwb(0 0% 50% / 0.4);
		}
		:host([data-theme="dark"]) .danger:active {
			box-shadow:
				0 0px 2px 0.5px hwb(0 0% 100% / 0.15),
				0 4px 6px hwb(0 0% 100% / 0.2) inset;
		}

		/* NoBg - Light */
		:host(:not([data-theme="dark"])) .noBg {
			background: none;
			box-shadow: none;
		}
		:host(:not([data-theme="dark"])) .noBg:hover {
			box-shadow:
				0 1.5px 4px 0 hwb(var(--hoverShadow, 0 0% 100%) / 0.15),
				0 1px 0.5px 0px hwb(var(--hoverLightBg, 0 100% 0%)) inset;
		}
		:host(:not([data-theme="dark"])) .noBg:active {
			box-shadow:
				0 0 2px 1px hwb(var(--hoverShadow, 0 0% 100%) / 0.05),
				0 6px 12px hwb(var(--hoverShadow, 0 0% 100%) / 0.1) inset;
		}

		/* NoBg - Dark */
		:host([data-theme="dark"]) .noBg {
			background: none;
			box-shadow: none;
		}
		:host([data-theme="dark"]) .noBg:hover {
			box-shadow:
				0 0 1.5px 0.5px hwb(var(--hoverLightBg, 0 20% 80%)),
				0 1.5px 4px 0 hwb(var(--hoverShadow, 0 0% 100%) / 0.3),
				0 1px 0.5px 0px hwb(var(--hoverLightBg, 0 20% 80%)) inset;
		}
		:host([data-theme="dark"]) .noBg:active {
			box-shadow:
				0 0 2px 1px hwb(var(--hoverShadow, 0 0% 100%) / 0.05),
				0 6px 18px hwb(var(--hoverShadow, 0 0% 100%) / 0.4) inset;
		}
	`;

	constructor() {
		super();
		this.addEventListener('click', (e: Event) => {
			if (this.disabled) {
				e.stopImmediatePropagation();
			}
		});
		// 以下实现等同于装饰器 @consume({ context: themeContext, subscribe: true }) 的功能，保留注释以供参考
		// new ContextConsumer(this, {
		// 	context: themeContext,
		// 	subscribe: true,
		// 	callback: (value: Theme) => { this.theme = value; },
		// });
	}

	@property({ reflect: true }) type: ButtonType = 'normal';
	@property({ reflect: true }) size: ButtonSize = 'normal';
	@property({ reflect: true, type: Boolean }) disabled = false;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	render() {
		const typeClass = this.type !== 'normal' ? this.type : '';
		const sizeClass = this.size !== 'normal' ? this.size : '';
		const classes = ['button', typeClass, sizeClass].filter(Boolean).join(' ');

		return html`
			<button
				class=${classes}
				?disabled=${this.disabled}
			>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-button': FFBoxButton;
	}
}

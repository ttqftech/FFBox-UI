import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface TooltipOptions {
	content: string;
	style: Partial<CSSStyleDeclaration>;
	className?: string;
}

@customElement('ffbox-tooltip')
export class FFBoxTooltip extends LitElement {
	static show: (options: TooltipOptions) => void;
	static hide: () => void;

	static styles = css`
		:host {
			display: block;
			position: fixed;
			z-index: 100;
			pointer-events: none;
			max-width: calc(200px + 25%);
		}

		.tooltip-box {
			padding: 10px 12px;
			background: hwb(var(--bg98));
			border: hsl(0, 0%, 67%) 1px solid;
			border-radius: 10px;
			box-shadow: 0px 4px 8px hsla(0, 0%, 0%, 0.3);
			z-index: 5;
			opacity: 1;
			transition: opacity 0.1s linear;
		}

		.tooltip-box.hidden {
			opacity: 0;
			transition: opacity 0.2s linear;
		}

		.tooltip-box.small {
			position: relative;
			top: -1px;
			padding: 6px 10px;
			border-radius: 8px;
			border: none;
			background-color: hwb(var(--hoverLightBg) / 0.5);
			backdrop-filter: blur(8px) contrast(110%);
			box-shadow: 0 0 1px 0.5px hwb(var(--hoverLightBg)),
						0 1.5px 4px 0 hwb(var(--hoverShadow) / 0.2),
						0 1px 0.5px 0px hwb(var(--highlight) / 0.5) inset;
		}

		.tooltip-box.small .tooltip-message {
			font-size: 12px;
			line-height: 16px;
		}

		.tooltip-message {
			font-size: 14px;
			line-height: 1.3em;
			text-align: left;
		}
	`;

	@property({ reflect: true }) content = '';
	@property({ type: Boolean, reflect: true }) show = false;
	@property({ reflect: true }) className = '';
	@property({ reflect: true, attribute: 'data-theme' }) theme: 'light' | 'dark' = 'light';

	render() {
		const lines = this.content.split('\n');
		const boxClasses = ['tooltip-box', this.show ? '' : 'hidden', this.className].filter(Boolean);

		return html`
			<div class=${boxClasses.join(' ')}>
				<div class="tooltip-message">
					${lines.map((line, i) => html`${line}${i < lines.length - 1 ? html`<br/>` : ''}`)}
				</div>
			</div>
		`;
	}
}

let _instance: FFBoxTooltip | null = null;

function _getInstance(): FFBoxTooltip {
	if (!_instance) {
		_instance = document.createElement('ffbox-tooltip') as FFBoxTooltip;
		document.body.appendChild(_instance);
	}
	return _instance;
}

function _detectTheme(): 'light' | 'dark' {
	const provider = document.querySelector<HTMLElement & { theme: string }>('ffbox-theme-provider');
	if (provider) return provider.theme as 'light' | 'dark';
	return 'light';
}

FFBoxTooltip.show = function (options: TooltipOptions) {
	const el = _getInstance();
	el.theme = _detectTheme();	// 因组件游离在 Provider 外，如需使用主题，需手动查找元素
	el.content = options.content;
	el.className = options.className ?? '';
	el.show = true;
	el.style.top = '';
	el.style.bottom = '';
	el.style.left = '';
	el.style.right = '';
	el.style.transform = '';
	if (options.style) {
		Object.assign(el.style, options.style);
	}
};

FFBoxTooltip.hide = function () {
	if (_instance) {
		_instance.show = false;
	}
};

export { tooltip, useTooltip, type TooltipPosition, type TooltipStyleName } from './use-tooltip.js';
export { enableTooltipAutoscan, disableTooltipAutoscan } from './tooltip-autoscan.js';

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-tooltip': FFBoxTooltip;
	}
}

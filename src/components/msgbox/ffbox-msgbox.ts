import '../theme-provider/ffbox-theme-provider.js';
import '../button/ffbox-button.js';
import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import type { ButtonType } from '../button/ffbox-button.js';

export interface MsgboxButton {
	text: string;
	callback?: () => boolean | Promise<void> | void;
	type?: ButtonType;
	role?: 'confirm' | 'cancel';
}

export interface MsgboxOptions {
	container?: HTMLElement;	// 指定外侧容器，如不指定则默认全屏展示
	image?: TemplateResult;		// 弹窗图片（Vue 版为 VNode，此处为 Lit TemplateResult）
	title?: string;
	content?: string | TemplateResult | (() => TemplateResult);	// 支持返回模板的函数，用于响应式内容
	buttons?: MsgboxButton[];
}

const defaultButton: MsgboxButton = {
	text: '好嘅',
	type: 'normal',
	callback: () => console.log('cancelled'),
};
// 原版定义了 defaultButton 但并未使用（不传 buttons 时会渲染出一个无法关闭的弹窗），此处在未提供 buttons 时启用它

@customElement('ffbox-msgbox')
export class FFBoxMsgbox extends LitElement {
	static show: (options?: MsgboxOptions) => FFBoxMsgbox;

	static styles = css`
		:host {
			/* host 承担原版 <dialog> 的铺满定位（Web Component 多了一层宿主，若不做定位则高度为 0） */
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			color: inherit;
			outline: none;
			z-index: 5;
		}

		.dialog {
			display: flex;
			justify-content: center;
			align-items: center;
			background: none;
			border: none;
			margin: 0;
			padding: 0;
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
			color: inherit;
		}

		.background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			will-change: opacity;
			background-color: hwb(var(--bg90) / 0.3);
			backdrop-filter: blur(1.5px);
			opacity: 0;
			transition: opacity 0.2s ease-out;	/* 对应 bganimate-leave-active */
		}
		.background.entered {
			opacity: 1;
			transition: opacity 0.3s ease-out;	/* 对应 bganimate-enter-active */
		}

		.box {
			display: flex;
			flex-direction: column;
			align-items: center;
			min-width: 200px;
			padding: 16px 24px;
			border-radius: 8px;
			background-color: hwb(var(--bg97) / 0.8);
			box-shadow: 0 3px 2px -2px hwb(var(--highlight)) inset,	/* 上亮光 */
					0 16px 32px 0px hwb(var(--hoverShadow) / 0.02),
					0 6px 6px 0px hwb(var(--hoverShadow) / 0.02),
					0 0 0 1px hwb(var(--highlight) / 0.9);	/* 包边 */
			transition: transform cubic-bezier(0.33, 1, 1, 1) 0.3s, opacity linear 0.2s;
			z-index: 0;	/* 可能是由于 chromium 的 bug，不加这个会导致背景的 backdrop-filter 应用到 box 上 */
			/* 对应 boxanimate-enter-from */
			transform: scale(1.1);
			opacity: 0;
		}
		.box > *:not(:last-child) {
			margin-bottom: 12px;
		}
		.box.entered {
			/* 对应 boxanimate-enter-to / boxanimate-leave-from */
			transform: scale(1);
			opacity: 1;
		}
		.box.leaving {
			/* 对应 boxanimate-leave-active + boxanimate-leave-to */
			transition: all linear 0.2s;
			transform: scale(0.9);
			opacity: 0;
		}

		.image {
			height: 96px;
		}
		.image > * {
			height: 100%;
		}
		.title {
			font-size: 17px;
			font-weight: 500;
		}
		.content {
			font-size: 14px;
			margin: 4px 0 24px;
		}
		.buttons {
			display: flex;
		}
	`;

	@property({ reflect: true }) title = '';
	@property({ attribute: false }) image?: TemplateResult;
	@property({ attribute: false }) content?: string | TemplateResult | (() => TemplateResult);
	@property({ attribute: false }) buttons?: MsgboxButton[];
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _entered = false;
	@state() private _leaving = false;
	@state() private _disable = false;
	@state() private _backgroundMouseDown = false;
	private previousActiveElement: HTMLElement | null = null;

	@query('.box') private _boxEl!: HTMLDivElement;

	private get _mouseDownTransformStyle() {
		return this._backgroundMouseDown
			? { transform: 'scale(0.97)', transition: 'all cubic-bezier(0.1, 2.5, 0.6, 1) 0.5s' }
			: {};
	}

	firstUpdated() {
		// 对应原版的 setTimeout(..., 0)：等首帧渲染完成后再进场，否则 transition 不生效
		requestAnimationFrame(() => {
			this.previousActiveElement = document.activeElement as HTMLElement | null;
			this._entered = true;
			this.addEventListener('keydown', this._handleKeyPress);
			// 焦点落在 dialog 本身，键盘事件才能冒泡到本组件（原版把监听挂在 <dialog> 上，效果相同）
			this.tabIndex = -1;
			this.focus();
		});
	}

	disconnectedCallback() {
		this.removeEventListener('keydown', this._handleKeyPress);
		if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
			this.previousActiveElement.focus();
		}
		super.disconnectedCallback();
	}

	private get _buttons(): MsgboxButton[] {
		return this.buttons || [defaultButton];
	}

	private _handleKeyPress = (e: KeyboardEvent) => {
		const buttons = this._buttons;
		if (buttons.length === 1 && (e.key === 'Escape' || e.key === 'Enter')) {
			this._handleButtonClick(buttons[0]);
			e.stopPropagation();
		} else if (e.key === 'Escape') {
			const button = buttons.find((button) => button.role === 'cancel');
			if (button) {
				this._handleButtonClick(button);
				e.stopPropagation();
			}
		} else if (e.key === 'Enter') {
			const button = buttons.find((button) => button.role === 'confirm');
			if (button) {
				this._handleButtonClick(button);
				e.stopPropagation();
			}
		}
	};

	private _handleButtonClick(button: MsgboxButton) {
		if (button.callback) {
			this._disable = true;
			const ret = button.callback();
			if (ret === undefined || ret === true) {
				this.close();
			} else if (ret instanceof Promise) {
				ret.then(() => this.close());
			} else {
				this._disable = false;
			}
		} else {
			this.close();
		}
	}

	/** 播放离场动画，动画结束后组件自行从 DOM 移除并派发 closed 事件 */
	close() {
		if (this._leaving) return;
		this._leaving = true;
		this.removeEventListener('keydown', this._handleKeyPress);
		// 原版由 Vue Transition 的 after-leave 回调触发，这里改用 transitionend + 兜底定时器
		const finish = () => {
			this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }));
			this.remove();
		};
		let done = false;
		const once = (e: TransitionEvent) => {
			if (e.target !== this._boxEl || done) return;
			done = true;
			finish();
		};
		this._boxEl?.addEventListener('transitionend', once);
		setTimeout(() => {
			if (done) return;
			done = true;
			finish();
		}, 300);
	}

	render() {
		const buttons = this._buttons;
		const backgroundClasses = ['background', this._entered && !this._leaving ? 'entered' : ''].filter(Boolean).join(' ');
		const boxClasses = ['box', this._entered && !this._leaving ? 'entered' : '', this._leaving ? 'leaving' : ''].filter(Boolean).join(' ');
		const content = typeof this.content === 'function' ? this.content() : this.content;

		return html`
			<dialog class="dialog">
				<div
					class=${backgroundClasses}
					@mousedown=${() => this._backgroundMouseDown = true}
					@mouseup=${() => this._backgroundMouseDown = false}
				></div>
				<div class=${boxClasses} style=${styleMap(this._mouseDownTransformStyle)}>
					${this.image ? html`<div class="image">${this.image}</div>` : ''}
					${this.title ? html`<div class="title">${this.title}</div>` : ''}
					${content ? html`<div class="content">${content}</div>` : ''}
					<div class="buttons">
						${buttons.map((button) => html`
							<ffbox-button
								type=${button.type ?? 'normal'}
								?disabled=${this._disable}
								@click=${() => this._handleButtonClick(button)}
							>${button.text}</ffbox-button>
						`)}
					</div>
				</div>
			</dialog>
		`;
	}
}

function _detectTheme(): Theme {
	const provider = document.querySelector<HTMLElement & { theme: string }>('ffbox-theme-provider');
	if (provider) return provider.theme === 'dark' ? 'dark' : 'light';
	return 'light';
}

FFBoxMsgbox.show = function (options: MsgboxOptions = {}): FFBoxMsgbox {
	const el = document.createElement('ffbox-msgbox') as FFBoxMsgbox;
	el.title = options.title ?? '';
	el.image = options.image;
	el.content = options.content;
	el.buttons = options.buttons;
	el.theme = _detectTheme();	// 若容器在 theme-provider 内，@consume 会用 provider 的值覆盖此处
	const container = options.container || document.body;
	container.appendChild(el);
	return el;
};

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-msgbox': FFBoxMsgbox;
	}
}

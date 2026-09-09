import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { customElement, property, state, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import closeIcon from './close.svg?raw';

export interface PopupOptions {
	message: string;
	level?: 0 | 1 | 2 | 3;	// 白 | 绿 | 黄 | 红
}

interface Instance {
	el: FFBoxPopup;
	id: number;
}

const instances: Instance[] = [];
let seed = 0;

let container: HTMLDivElement | undefined;

@customElement('ffbox-popup')
export class FFBoxPopup extends LitElement {
	static show: (options: PopupOptions) => FFBoxPopup;

	static styles = css`
		:host {
			display: block;
			position: absolute;
			bottom: 10%;
			left: 0;
			right: 0;
			width: fit-content;
			max-width: 60%;
			background: none;
			border: none;
			margin: auto;
			padding: 0;
			transition: transform 0.7s cubic-bezier(0.35, 1.4, 0.2, 0.95);
			z-index: 10;
		}

		.popup-box {
			width: fit-content;
			display: flex;
			align-items: stretch;
			padding: 8px;
			background: hwb(var(--bg98));
			border: hsl(0, 0%, 67%) 1px solid;
			border-radius: 12px;
			overflow: hidden;
			box-shadow: 0px 4px 8px hwb(0 0% 100% / 0.3);
			/* 对应 popupanimate-enter-from */
			opacity: 0;
			transform: scale(0) translateY(120px);
		}
		.popup-box.entered {
			/* 对应 popupanimate-enter-active + enter-to */
			transition: transform 0.5s cubic-bezier(0.4, 1.3, 0.4, 1), opacity 0.2s linear;
			opacity: 1;
			transform: scale(1);
		}
		.popup-box.leaving {
			/* 对应 popupanimate-leave-active + leave-to */
			transition: opacity 0.7s ease-out, transform 0.6s cubic-bezier(1, 0, 1, 1) 0.1s;
			opacity: 0;
			transform: scale(0.5);
		}
		.popup-box.leaving.user {
			/* 对应 popupanimateUser-leave-active + leave-to */
			transition: all 0.5s linear;
			opacity: 0;
			transform: scale(0.5) translateX(calc(100vw + 400px));
		}

		.popup-box:hover .popup-progress .popup-progress-circle {
			opacity: 0;
			transform: rotate(-90deg) scale(0.5);
		}
		.popup-box:hover .popup-progress .popup-progress-x {
			opacity: 1;
			transform: translateX(0);
		}

		.popup-message {
			margin: 4px;
			font-size: 16px;
			line-height: 1.3em;
			text-align: center;
			word-break: break-word;
		}

		.popup-progress {
			position: relative;
			width: 24px;
			height: auto;
			display: flex;
			justify-content: center;
			align-items: center;
			opacity: 0.8;
		}
		.popup-progress-circle {
			width: 16px;
			height: 16px;
			transform: rotate(-90deg) scale(1);
			transition: transform 0.3s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.3s cubic-bezier(0.1, 0.8, 0.3, 1);
		}
		.popup-progress-circle:hover {
			visibility: hidden;
		}
		.popup-progress-x {
			position: absolute;
			width: 24px;
			height: 100%;
			margin: auto;
			border-radius: 4px;
			opacity: 0;
			transform: translateX(-32px);
			transition: transform 0.3s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.3s cubic-bezier(0.1, 0.8, 0.3, 1);
			cursor: pointer;
		}
		.popup-progress-x svg {
			width: 100%;
			height: 100%;
			color: inherit;
		}
		.popup-progress-x:hover {
			box-shadow: 0 1px 4px hwb(var(--hoverShadow) / 0.2),
						0 4px 2px -2px hwb(var(--highlight) / 0.5) inset;
		}
		.popup-progress-x:active {
			box-shadow: 0 0px 1px hwb(var(--hoverShadow) / 0.2),
						0 15px 20px -10px hwb(var(--hoverShadow) / 0.15) inset;
			transform: translateY(0.25px);
		}

		/* 主题 */
		:host([data-theme="light"]) .popup-ok {
			background: linear-gradient(180deg, hwb(120 40% 10%), hwb(120 20% 20%));
			border-color: hwb(120 15% 35%);
			box-shadow: 0px 4px 8px hwb(120 10% 35% / 0.4);
			color: #FFF;
		}
		:host([data-theme="light"]) .popup-warning {
			background: linear-gradient(180deg, hwb(45 50% 0%), hwb(45 30% 0%));
			border-color: hwb(45 30% 10%);
			box-shadow: 0px 4px 8px hwb(45 10% 35% / 0.4);
			color: hsl(46, 66%, 15%);
		}
		:host([data-theme="light"]) .popup-error {
			background: hwb(0 35% 5%);
			border-color: hwb(0 20% 20%);
			box-shadow: 0px 4px 8px hwb(0 5% 40% / 0.4);
			color: #FFF;
		}

		:host([data-theme="dark"]) .popup-ok {
			background: linear-gradient(180deg, hwb(120 30% 15%), hwb(120 10% 25%));
			border-color: hwb(120 10% 45%);
			box-shadow: 0px 4px 8px hwb(120 5% 45% / 0.4);
			color: #FFF;
		}
		:host([data-theme="dark"]) .popup-warning {
			background: linear-gradient(180deg, hwb(45 40% 0%), hwb(45 20% 0%));
			border-color: hwb(45 25% 15%);
			box-shadow: 0px 4px 8px hwb(45 10% 30% / 0.4);
			color: hsl(46, 66%, 15%);
		}
		:host([data-theme="dark"]) .popup-error {
			background: hwb(0 30% 10%);
			border-color: hwb(0 20% 30%);
			box-shadow: 0px 4px 8px hwb(0 5% 40% / 0.4);
			color: #FFF;
		}
	`;

	@property({ reflect: true }) message = '';
	@property({ type: Number }) level: 0 | 1 | 2 | 3 = 0;
	@property({ type: Number }) verticalOffset = 0;	// px
	@property({ type: Number }) index = 0;			// 用于计算 delayedVerticalOffset
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _show = false;
	@state() private _duration = 0;
	@state() private _timeLeft = 0;
	@state() private _mouseIn = false;
	@state() private _delayedVerticalOffset = 0;
	@state() private _userClosing = false;	// 用户主动关闭时换一个动画
	@state() private _leaving = false;

	@query('.popup-box') private _boxEl!: HTMLDivElement;

	private _timerId?: ReturnType<typeof setTimeout>;

	private get _bgClass(): string {
		switch (this.level) {
			case 1: return 'popup-box popup-ok';
			case 2: return 'popup-box popup-warning';
			case 3: return 'popup-box popup-error';
			default: return 'popup-box';
		}
	}

	private get _strokeColor(): string {
		switch (this.level) {
			case 1: return '#FFFFFF';
			case 2: return '#3F330D';
			case 3: return '#FFFFFF';
			default: return 'currentColor';
		}
	}

	private _handleMouseEnter = () => { this._mouseIn = true; };
	private _handleMouseLeave = () => { this._mouseIn = false; };

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('mouseenter', this._handleMouseEnter);
		this.addEventListener('mouseleave', this._handleMouseLeave);
	}

	firstUpdated() {
		// 设置动画并自动退出
		const powerSave = true;
		this._show = true;
		this._duration = 2500 + this.message.length * 100;
		this._timeLeft = this._duration;
		let lastTime = new Date().getTime();
		const count = () => {
			const now = new Date().getTime();
			if (!this._mouseIn) {
				this._timeLeft = this._timeLeft - (now - lastTime);
				if (this._timeLeft <= 0) {
					this._close();
				}
			} else {
				this._timeLeft += (this._duration - this._timeLeft) * 0.2;
			}
			if (this._show) {
				if (powerSave) {
					this._timerId = setTimeout(count, 67);
				} else {
					requestAnimationFrame(count);
				}
			}
			lastTime = now;
		};
		count();
	}

	disconnectedCallback() {
		this.removeEventListener('mouseenter', this._handleMouseEnter);
		this.removeEventListener('mouseleave', this._handleMouseLeave);
		this._show = false;
		if (this._timerId !== undefined) clearTimeout(this._timerId);
		super.disconnectedCallback();
	}

	willUpdate(changed: Map<string, unknown>) {
		if (changed.has('verticalOffset')) {
			// 逐条延迟上移，形成依次归位的动画
			setTimeout(() => {
				this._delayedVerticalOffset = this.verticalOffset;
			}, 33 * this.index);
		}
	}

	updated() {
		// 垂直偏移与 pointer-events 作用在 host 上（对应 Vue 版根元素 .popup 的内联样式）
		this.style.transform = `translateY(${-this._delayedVerticalOffset}px)`;
		this.style.pointerEvents = this._show ? 'auto' : 'none';
	}

	render() {
		const lines = this.message.split('\n');
		const boxClasses = [this._bgClass, this._show && !this._leaving ? 'entered' : '', this._leaving ? 'leaving' : '', this._leaving && this._userClosing ? 'user' : ''].filter(Boolean).join(' ');
		const dashOffset = -125.664 * (1 - this._timeLeft / (this._duration || 1));

		return html`
			<div class=${boxClasses} @mousedown=${this._handleMouseDown} @mouseup=${this._handleMouseUp}>
				<div class="popup-progress">
					<svg viewBox="-24 -24 48 48" class="popup-progress-circle">
						<circle
							fill="transparent"
							stroke-width="6"
							stroke=${this._strokeColor}
							stroke-dasharray="125.664"
							stroke-dashoffset=${dashOffset}
							r="20"
						></circle>
					</svg>
					<div class="popup-progress-x" style="color: ${this._strokeColor}" @click=${() => this._close(true)}>${unsafeSVG(closeIcon)}</div>
				</div>
				<div class="popup-message">
					${lines.map((line, i) => html`${line}${i < lines.length - 1 ? html`<br/>` : ''}`)}
				</div>
			</div>
		`;
	}

	private _handleMouseDown(event: MouseEvent) {
		if (event.button === 1) {
			event.preventDefault();
		}
	}

	private _handleMouseUp(event: MouseEvent) {
		if (event.button === 1) {
			this._close(true);
		}
	}

	private _close(isUserInteraction?: boolean) {
		if (this._leaving) return;
		if (isUserInteraction) {
			this._userClosing = true;
		}
		this._show = false;
		this._leaving = true;
		// 由本组件调用，通知外部倒计时后调整气泡位置
		this.dispatchEvent(new CustomEvent('will-close', {
			detail: { isUserInteraction: isUserInteraction ?? false },
			bubbles: true,
			composed: true,
		}));
		// 由本组件调用，外部将本组件销毁
		const finish = () => {
			this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }));
		};
		let done = false;
		const once = (e: TransitionEvent) => {
			if (e.target !== this._boxEl || done) return;
			done = true;
			finish();
		};
		this._boxEl?.addEventListener('transitionend', once);
		// 对应 popupanimate-leave-active（0.7s）与 popupanimateUser-leave-active（0.5s）
		setTimeout(() => {
			if (done) return;
			done = true;
			finish();
		}, this._userClosing ? 550 : 750);
	}
}

function _getContainer(): HTMLDivElement {
	if (!container) {
		container = document.createElement('div');
		// 原版是一个无样式的裸 div，气泡因此相对初始包含块定位，页面滚动后就不会跟随视口。
		// 这里把容器固定为视口大小（不吃指针事件），气泡的 bottom: 10% 才始终落在视口底部。
		container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
		document.body.appendChild(container);
	}
	return container;
}

function _detectTheme(): Theme {
	const provider = document.querySelector<HTMLElement & { theme: string }>('ffbox-theme-provider');
	if (provider) return provider.theme === 'dark' ? 'dark' : 'light';
	return 'light';
}

function _handleOnWillClose(id: number, isUserInteraction?: boolean) {
	const index = instances.findIndex((item) => item.id === id);
	// console.log('气泡 will close', id);
	if (index === -1) return;
	instances.splice(index, 1);
	setTimeout(() => {
		_reCalcVerticalOffset();
	}, isUserInteraction ? 0 : 300);
}

function _reCalcVerticalOffset() {
	for (let i = 0, totalHeight = 0; i < instances.length; i++) {
		const instance = instances[i];
		instance.el.index = i;
		instance.el.verticalOffset = totalHeight;
		totalHeight += instances[i].el.offsetHeight + 16;
	}
}

FFBoxPopup.show = function (options: PopupOptions): FFBoxPopup {
	const el = document.createElement('ffbox-popup') as FFBoxPopup;
	el.message = options.message;
	el.level = options.level ?? 0;
	el.verticalOffset = 0;
	el.index = instances.length;
	el.theme = _detectTheme();	// 气泡挂在 body 下，不在 theme-provider 内，需手动检测
	const id = seed++;
	el.addEventListener('will-close', (e) => _handleOnWillClose(id, (e as CustomEvent).detail?.isUserInteraction));
	el.addEventListener('closed', () => {
		el.parentElement?.removeChild(el);
	});
	_getContainer().appendChild(el);
	instances.unshift({ el, id });
	// console.log('气泡数量', instances.length, container.children.length);
	if (instances.length > 30) {
		// 删除过多的气泡避免卡顿
		const oldest = instances.pop()!;
		oldest.el.remove();
	}
	// 等待 Lit 将组件渲染到 DOM 上后修改其他气泡的偏移量
	el.updateComplete.then(_reCalcVerticalOffset);
	return el;
};

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-popup': FFBoxPopup;
	}
}
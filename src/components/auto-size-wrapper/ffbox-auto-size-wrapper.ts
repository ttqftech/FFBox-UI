import '../theme-provider/ffbox-theme-provider.js';
import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { themeContext, Theme } from '../../contexts/theme-context.js';

export interface Size {
	width: number;
	height: number;
}

/**
 * 本组件适用于需要对不定高度组件进行通过高度变化的动画进行显隐的场景
 * AutoSizeWrapper 自身是一个 div，能测量 slot 中所有组件的高度并反馈到 style 或 customStyle 函数的参数中
 * 由于 slot 可以是多个组件，所以会多一层 div 进行打包测量高度
 * 注意此组件并不适用于通过动态高度 slot 组件的高度修改 slot 组件的高度，因为这个逻辑回环了。子组件的高度应当是自由撑开的，否则无法测量高度
 *
 * 迁移说明：Vue 版同时提供 style 与 customStyle 两个 prop（customStyle 是 style 不生效时的替代）。
 * 在 Web Component 中 style 与 HTMLElement.style 冲突，故统一为 customStyle。
 */
@customElement('ffbox-auto-size-wrapper')
export class FFBoxAutoSizeWrapper extends LitElement {
	static styles = css`
		:host {
			display: block;
		}

		.autoSizeWrapper > div {
			/* 测量层：宽度撑满以便反映 slot 的真实高度，不做任何裁剪 */
			display: block;
		}
	`;

	@property({ type: Boolean, attribute: 'use-resize-observer' }) useResizeObserver = false;
	@property({ attribute: false }) customStyle?: (size: Size) => Record<string, string>;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	/** 最近一次测量到的 slot 宽度（只读） */
	@state() width = 0;
	/** 最近一次测量到的 slot 高度（只读） */
	@state() height = 0;

	@query('.autoSizeWrapper') private _containerEl!: HTMLDivElement;

	private _resizeObserver?: ResizeObserver;

	connectedCallback() {
		super.connectedCallback();
		if (!this._resizeObserver) {
			this._resizeObserver = new ResizeObserver(() => this._updateSize());
		}
	}

	firstUpdated() {
		// 与 Vue 版的 onMounted + nextTick 对应：等首帧渲染完成后再测量
		// （放在 rAF 中可避免 Lit 的 change-in-update 警告）
		requestAnimationFrame(() => this._updateSize());
		if (this.useResizeObserver) {
			this._observeSlot(true);
		}
	}

	updated(changed: Map<string, unknown>) {
		// 运行时监听 useResizeObserver 变化（Vue 版本中暂无此功能）
		if (changed.has('useResizeObserver')) {
			this._observeSlot(this.useResizeObserver);
		}
	}

	disconnectedCallback() {
		this._observeSlot(false);
		super.disconnectedCallback();
	}

	private _observeSlot(observe: boolean) {
		const target = this._containerEl?.firstElementChild;
		if (!target || !this._resizeObserver) return;
		if (observe) {
			this._resizeObserver.observe(target);
		} else {
			this._resizeObserver.unobserve(target);
		}
	}

	/** 重新测量 slot 尺寸。外部在 slot 内容变化后也可主动调用 */
	updateSize() {
		this._updateSize();
	}

	private _updateSize() {
		const target = this._containerEl?.firstElementChild;
		if (!target) return;
		const rect = target.getBoundingClientRect();
		this.width = rect.width;
		this.height = rect.height;
		this.dispatchEvent(new CustomEvent('resize', {
			detail: { width: this.width, height: this.height },
			bubbles: true,
			composed: true,
		}));
	}

	render() {
		return html`
			<div class="autoSizeWrapper" style=${styleMap(this.customStyle?.({ width: this.width, height: this.height }) || {})}>
				<div>
					<slot></slot>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-auto-size-wrapper': FFBoxAutoSizeWrapper;
	}
}
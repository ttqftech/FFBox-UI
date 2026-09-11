import '../theme-provider/ffbox-theme-provider.js';
import '../menu/ffbox-menu.js';
import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import { FFBoxMenu, type FFBoxMenuHandle } from '../menu/ffbox-menu.js';
import type { MenuItem } from '../menu/menu-item.js';
import menuButtonIcon from './menu_button.svg?raw';

/**
 * 由 src/renderer/src/components/DropdownInput/DropdownInput.vue 迁移而来。
 * 原版的 onChange / onEnter 回调 prop 改为 change / enter 自定义事件；
 * 原版 watch(inputText) 的即时校验在 Lit 版中由 _handleInput / onSelect 中的 _validate() 等价实现；
 * 原版选中/输入后的值由父组件在 onChange 中写回 :text prop（受控用法），Web Component 为自包含组件，
 * 改为组件内部将当前值同步回 text 属性，保证重新打开菜单时能从当前选中项继续定位；
 * onChange 回调在选中（含键盘方向键选择）与输入时触发，onEnter 在未打开菜单时按下导航键（含 Enter）触发。
 */
@customElement('ffbox-dropdown-input')
export class FFBoxDropdownInput extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
		}

		.combobox-selector {
			position: relative;
			height: 24px;
			/* width: 122px; */
			flex-grow: 1;
			border-radius: 24px;
			background: var(--f7);
			border: #AAA 1px solid;
			box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		}
		.combobox-selector:hover {
			background: var(--ff);
		}
		.combobox-selector:active {
			background: var(--e7);
		}
		.combobox-selector.focused {
			background: var(--ff);
		}
		/* 校验有误的情况下背景和边框都变红 */
		.combobox-selector.invalid {
			border: var(--errorBorder) 1px solid;
			box-shadow: 0 0 12px hsla(0, 100%, 60%, 0.3), 0px 4px 8px hwb(0 0 0 / 0.05);
		}
		.combobox-selector.invalid.focused {
			background: var(--errorBgActive);
		}
		.combobox-selector.invalid:not(.focused) {
			background: var(--errorBg);
		}
		/* 禁用的情况下整体变透明，并且固定背景颜色 */
		:host([disabled]) .combobox-selector {
			opacity: 0.6;
			color: var(--66); /* 默认，20% 亮度黑色，变灰 40% 亮度黑色 */
			background: var(--f7);
		}

		.combobox-selector input {
			position: absolute;
			left: 6px;
			width: calc(100% - 28px);
			height: 24px;
			line-height: 24px;
			background: none;
			border: none;
			margin: 0;
			padding: 0;
			outline: none;
			font-family: inherit;
			font-size: 13px;
			color: inherit;
		}

		.combobox-selector-img {
			position: absolute;
			right: 6px;
			top: 4px;
			width: 16px;
			height: 16px;
			font-size: 0; /* 纯 HTML 状态下，代码中的换行会被渲染出来，需要设置为 0 来屏蔽 */
		}
	`;

	@property({ attribute: false }) text?: string | number;
	@property({ attribute: false }) list: MenuItem[] = [];
	@property({ type: Boolean, reflect: true }) readonly = false;	// 不允许输入，但允许下拉选择
	@property({ type: Boolean, reflect: true }) disabled = false;	// 不允许更改
	@property() placeholder = '';
	@property({ attribute: false }) validator?: (value: string) => string | undefined;
	@property({ attribute: false }) inputFixer?: (value: string) => string;
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _focused = false;
	@state() private _inputText = '-';	// 原版初值为 '-'，onMounted 时会以 text 属性覆盖
	@state() private _invalidMsg: string | undefined = undefined;

	@query('.combobox-selector') private _selectorEl!: HTMLDivElement;

	private _menuHandle: FFBoxMenuHandle | null = null;

	willUpdate(changed: PropertyValues) {
		// 监听 props 中的 text，并在其更新时依此更新 data 中的 inputText（与输入框双向绑定）
		if (changed.has('text')) {
			this._inputText = this.text !== undefined ? this.text + '' : '';
			this._validate();
		}
		// 对应原版 watch(inputText, ..., { immediate: true })
		if (changed.has('validator')) {
			this._validate();
		}
	}

	render() {
		const classes = ['combobox-selector'];
		if (this._focused) classes.push('focused');
		if (this._invalidMsg) classes.push('invalid');

		return html`
			<div class=${classes.join(' ')} @click=${this._openMenu}>
				<input
					type="text"
					.value=${this._inputText}
					?readonly=${this.readonly || this.disabled}
					?disabled=${this.disabled}
					.placeholder=${this.placeholder}
					@blur=${this._handleBlur}
					@focus=${this._handleFocus}
					@input=${this._handleInput}
					@keydown=${this._handleKeydown}
				/>
				<span class="combobox-selector-img">${unsafeSVG(menuButtonIcon)}</span>
			</div>
		`;
	}

	// 输入框点击、方向键等打开菜单
	private _openMenu = () => {
		if (this.disabled) {
			return;
		}
		this._menuHandle = FFBoxMenu.showMenu({
			menu: this.list,
			type: 'select',
			selectedValue: this.text,
			triggerElem: this._selectorEl,	// 传入触发元素，菜单据此计算弹出位置与方向
			onSelect: (_event, value) => {
				this._inputText = value;
				this.text = value;	// 同步回 text 属性（原版由父组件在 onChange 中写回），重开菜单时据此从当前选中项继续
				this._validate();
				this._dispatchChange(value);
				this._menuHandle!.setSelectedValue(value);	// 更改值后主动反馈至菜单
			},
			onClose: () => {
				this._menuHandle = null;
			},
			returnFocus: (_e) => {
				(this._selectorEl.firstElementChild as HTMLElement).focus();
			},
			onKeyDown: (e) => {
				if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
					let selPos = (this._selectorEl.firstChild as HTMLInputElement).selectionStart || 0;
					if (e.key === 'ArrowLeft') {
						selPos--;
					} else if (e.key === 'ArrowRight') {
						selPos++;
					}
					(this._selectorEl.firstChild as HTMLInputElement).selectionStart = selPos;
					(this._selectorEl.firstChild as HTMLInputElement).selectionEnd = selPos;
				}
			},
		});

		(this._selectorEl.firstElementChild as HTMLElement).focus();
	};

	private _handleBlur() {
		this._focused = false;
	}

	private _handleFocus() {
		this._focused = true;
	}

	private _handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		// 原版通过 v-model 无条件同步 inputText，有 inputFixer 时再以修正值覆盖
		this._inputText = this.inputFixer ? this.inputFixer(input.value) : input.value;
		this.text = this._inputText;	// 同步回 text 属性（原版由父组件在 onChange 中写回），重开菜单时据此从当前值继续
		let newValue = input.value;
		this._menuHandle?.setSelectedValue(newValue);
		this._validate();
		this._dispatchChange(newValue);
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Escape'].includes(event.key)) {
			if (this._menuHandle) {
				this._menuHandle.triggerKeyboardEvent(event);
				event.preventDefault();
			} else {
				// 原版若定义了 onEnter 回调则优先使用该行为；事件版改为在 Enter 键时派发 enter 事件，
				// ArrowUp / ArrowDown / Enter 未打开菜单情况下可打开菜单（与原版默认行为一致）
				if (event.key === 'Enter') {
					this.dispatchEvent(new CustomEvent('enter', {
						bubbles: true,
						composed: true,
					}));
				}
				if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
					this._openMenu();	// 未打开菜单情况下通过这些按键可打开菜单
					event.preventDefault();
				}
			}
		}
	}

	private _validate() {
		if (this.validator) {
			this._invalidMsg = this.validator(this._inputText ?? '');
		} else {
			this._invalidMsg = undefined;
		}
	}

	private _dispatchChange(value: string) {
		this.dispatchEvent(new CustomEvent('change', {
			detail: value,
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-dropdown-input': FFBoxDropdownInput;
	}
}

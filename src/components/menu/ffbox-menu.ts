import '../theme-provider/ffbox-theme-provider.js';
import '../checkbox/ffbox-checkbox.js';
import '../radio/ffbox-radio.js';
import '../tooltip/ffbox-tooltip.js';
import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap, type StyleInfo } from 'lit/directives/style-map.js';
import { ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import { FFBoxTooltip } from '../tooltip/ffbox-tooltip.js';
import type { MenuItem } from './menu-item.js';
import rightIcon from './right.svg?raw';

/**
 * 由 src/renderer/src/components/Menu/Menu.tsx + MenuComponent.vue 合并迁移而来。
 * Vue 版本拆成「命令式入口（Menu.tsx）+ 渲染组件（MenuComponent.vue）」两层，由 createVNode/render 挂载；
 * Lit 版本合并为一个自定义元素，通过 FFBoxMenu.showMenu() 命令式创建（对应 Vue 版导出的 showMenu）。
 */

export interface MenuOptions {
	menu: MenuItem[];
	type?: 'action' | 'select';	// select 类型的菜单会在键盘方向键操作时触发 onSelect，action 类型的菜单则在点击时触发 onSelect
	selectedValue?: any;
	container?: HTMLElement;	// 指定外侧容器，如不指定则默认全屏展示
	triggerRect?: { xMin: number, yMin: number, xMax: number, yMax: number };	// 触发菜单的控件的坐标，用于计算菜单弹出方向和大小
	triggerElem?: HTMLElement;	// 触发菜单的控件元素；未显式传入 triggerRect 时，自动以 getBoundingClientRect() 计算 triggerRect
	disableOnClick?: boolean;
	onSelect?: (event: Event, value: any, checked?: boolean) => void | false;	// action 模式时，不定义此项或返回 false 则触发 menuItem 的 onClick
	onCancel?: (event: Event) => void | false;	// mask 点击的情况会触发 onCancel，若返回 false 则不关闭菜单
	onClose?: () => void;
	onKeyDown?: (event: KeyboardEvent) => void;
	returnFocus?: (event: Event) => void;	// 定义该项后，菜单组件不监听全局键盘事件，若被 focus 则调用此函数用于归还焦点
}

/** FFBoxMenu.showMenu() 的返回值，对应 Vue 版 showMenu 的返回对象 */
export interface FFBoxMenuHandle {
	menu: FFBoxMenu;
	close: () => void;
	triggerKeyboardEvent: (event: KeyboardEvent) => void;
	setSelectedValue: (value: any) => void;
}

interface InnerMenu {
	menu: MenuItem[];
	menuIndex: number;	// 对每个菜单增加 menuIndex 项，用于标识这是哪一个菜单，作为 openedSubMenus 的项值
	parent: InnerMenu | null;
}

/**
 * 菜单有两种模式：动作菜单、选项菜单
 * 动作菜单一般无 selectedValue。只有鼠标点击或键盘 Enter 时触发 onSelect，触发后默认关闭菜单
 * 选项菜单一般有 selectedValue。鼠标点击、键盘 Enter 时触发 onSelect，触发后默认关闭菜单；键盘上下选择时触发 onSelect，触发后根据键盘按键决定是否关闭菜单
 */
@customElement('ffbox-menu')
export class FFBoxMenu extends LitElement {
	static showMenu: (options: MenuOptions) => FFBoxMenuHandle;

	static styles = css`
		:host {
			display: block;
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			color: inherit;
			z-index: 10;
		}
		.mask {
			position: relative;
			width: 100%;
			height: 100%;
			// pointer-events: none;
		}
		.menu {
			position: absolute;
			// width: 200px;
			box-sizing: border-box;
			padding: 6px;
			border-radius: 8px;
			font-size: 0;
			text-align: left;
			overflow-y: auto;
			background: hwb(var(--bg98));
			box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
			-webkit-app-region: none;
			user-select: none;
			/* 对应 Vue TransitionGroup 的 menuAnimate-enter 动画，原生 animation 在元素插入时自动触发 */
			animation: menuAnimateEnter cubic-bezier(0.33, 1, 1, 1) 0.15s, menuAnimateEnterOpacity linear 0.1s;
		}
		@keyframes menuAnimateEnter {
			from { transform: scale(0.95); }
			to { transform: scale(1); }
		}
		@keyframes menuAnimateEnterOpacity {
			from { opacity: 0; }
			to { opacity: 1; }
		}
		/* 对应 menuAnimate-leave 动画。Lit 无 TransitionGroup，由 maskLeaving 类统一驱动离场 */
		.maskLeaving .menu {
			transform: scale(0.95);
			opacity: 0;
			transition: all linear 0.1s;
		}
		.menu::-webkit-scrollbar {
			position: relative;
			width: 12px;
			// background: transparent;
			box-shadow: 12px 0 12px -12px hwb(0 50% 50% / 0.08) inset;
		}
		.menu::-webkit-scrollbar-thumb {
			border-radius: 12px;
			background: hwb(0 50% 50% / 0.3);
			border: 3px solid transparent;
			background-clip: content-box;
			// box-shadow: 0 0 4px red;
		}
		.menu::-webkit-scrollbar-track {
			background: none;
		}
		.menuItem {
			display: inline-block;
			position: relative;
			box-sizing: border-box;
			width: 100%;
			height: 32px;
			// border-bottom: #EEE 1px solid;
			border-radius: 4px;
			font-size: 14px;
			// outline: none;
		}
		.menuItem .label {
			position: absolute;
			top: 0;
			left: 30px;
			right: 30px;
			line-height: 32px;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.menuItem .iconArea {
			position: absolute;
			top: 0;
			left: 0;
			width: 28px;
			height: 32px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.menuItem .iconArea > svg {
			width: 20px;
			height: 20px;
		}
		.menuItem .iconRightArea {
			position: absolute;
			top: 0;
			right: 0;
			width: 28px;
			height: 32px;
		}
		.menuItem .iconRightArea svg {
			position: absolute;
			left: 25%;
			top: 25%;
			width: 50%;
			height: 50%;
		}
		/* 子菜单倾向向左打开时，右三角翻转（对应 Vue 的 :style transform rotate） */
		.menuItem .iconRightArea.flipped svg {
			transform: rotate(180deg);
		}
		.menuItem .opArea {
			position: absolute;
			top: 0;
			left: 0;
			width: 28px;
			height: 32px;
		}
		.menuItemDisabled {
			opacity: 0.3;
		}
		.menuItemSelected {
			background: hwb(var(--menuItemSelected));
		}
		.menuItemHovered {
			background: hwb(var(--menuItemHovered));
		}
		.menuSeparator {
			display: inline-block;
			position: relative;
			width: 100%;
			height: 1px;
			margin: 4px 0;
			background-color: #77777733;
		}
	`;

	@property({ attribute: false }) menu: MenuItem[] = [];
	@property({ attribute: false }) type: 'action' | 'select' = 'action';
	@property({ attribute: false }) selectedValue?: any;
	@property({ attribute: false }) triggerRect?: MenuOptions['triggerRect'];
	@property({ attribute: false }) onSelect?: MenuOptions['onSelect'];
	@property({ attribute: false }) onCancel?: MenuOptions['onCancel'];
	@property({ attribute: false }) onClose?: MenuOptions['onClose'];
	@property({ attribute: false }) onKeyDown?: MenuOptions['onKeyDown'];
	@property({ attribute: false }) returnFocus?: MenuOptions['returnFocus'];
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _openedSubMenus: number[] = [];
	@state() private _openedSubMenuItemPos: { [key: number]: { xMin: number, yMin: number, xMax: number, yMax: number, preferDirection: 'l' | 'r' } } = {};	// key：menuIndex / key　value：menuItem 的位置　preferDirection：子菜单倾向向哪个方向打开
	@state() private _currentHoveredItem: MenuItem | undefined = undefined;
	@state() private _currentSelectedItem: MenuItem | undefined = undefined;
	@state() private _leaving = false;

	private _flattenedMenus: InnerMenu[] = [];	// 非响应式，由 willUpdate 依据 menu 属性重算
	private _menuElemRefs: HTMLDivElement[] = [];
	private _unmounted = false;

	willUpdate(changed: PropertyValues) {
		if (changed.has('menu')) {
			this._flattenedMenus = this._flattenMenus();
		}
	}

	firstUpdated() {
		/**
		 * 组件初始化时：
		 * 1. 更改 currentHoveredItem 和 currentSelectedItem，进而在下一帧确定子菜单的打开状态、tooltip 的显示
		 * 2. 根据 returnFocus 确定是否添加全局键盘监听归还焦点
		 * 3. openedSubMenus 打开第一个菜单
		 * 4. 父到子计算子菜单的打开状态
		 * 5. 在子菜单 DOM 准备好后计算显示位置
		 * 6. 在 5. 后对选中项进行对焦
		 */
		this._currentSelectedItem = this.selectedValue;
		if (!this.returnFocus) {
			document.addEventListener('keydown', this._keydownListener);
		}
		this._openedSubMenus = [0];	// 需在 mounted 后才打开第一个菜单，这样就有动画
		const res = this._getMenuAndItemByValue(this.selectedValue);
		if (res) {
			const { menu, menuItem } = res;
			// 对应 Vue 版对 currentHoveredItem 的赋值：赋值会触发 watch(currentHoveredItem)，
			// 由其沿选中项的路径展开所有父级子菜单（选中项位于子菜单内时菜单才能定位到它）。
			// Lit 版 watch 的等价实现是 _setHoveredItem，须显式调用；若直接对 _currentHoveredItem 赋值
			// 会绕过子菜单展开逻辑，导致选中项在深层子菜单内时键盘导航失效
			this._setHoveredItem(menuItem);
			// 父到子计算每一节点的显示位置（需等待打开第一个菜单之后才计算）
			setTimeout(() => {
				this._calcSubMenuPosition(menu.menuIndex);
				// 激活对应项以自动滚动到该位置
				const { indexInFlattened, indexInMenu } = this._getMenuByItem(menuItem)!;
				const menuElem = this._menuElemRefs[indexInFlattened] as HTMLDivElement;
				const menuItemElem = menuElem.children[indexInMenu] as HTMLElement;
				menuItemElem.focus();
			}, 0);
		}
	}

	disconnectedCallback() {
		if (!this.returnFocus) {
			document.removeEventListener('keydown', this._keydownListener);
		}
		FFBoxTooltip.hide();
		super.disconnectedCallback();
	}

	render() {
		// 将所有子菜单打平后按 openedSubMenus 过滤，这样一个循环渲染所有可见菜单（代替原版 flattenedMenusFiltered）
		const menus = Object.values(this._flattenedMenus).filter((menu) => this._openedSubMenus.includes(menu.menuIndex));

		return html`
			<div
				class=${['mask', this._leaving ? 'maskLeaving' : ''].filter(Boolean).join(' ')}
				@click=${(e: Event) => this._handleCancel(e)}
			>
				${menus.map((menu) => this._renderMenu(menu))}
			</div>
		`;
	}

	private _renderMenu(menu: InnerMenu) {
		return html`
			<div
				class="menu"
				style=${styleMap(this._getMenuPosition(menu))}
				${ref((el: Element | undefined) => { if (el) this._menuElemRefs[menu.menuIndex] = el as HTMLDivElement; })}
				@mouseup=${(e: MouseEvent) => e.stopPropagation()}
				@click=${(e: Event) => e.stopPropagation()}
			>
				${menu.menu.map((menuItem, index) => this._renderMenuItem(menuItem, index))}
			</div>
		`;
	}

	private _renderMenuItem(menuItem: MenuItem, _index: number) {
		return html`
			<div
				class=${this._getMenuItemClassName(menuItem)}
				tabindex=${menuItem.type === 'separator' ? -1 : 0}
				@mouseup=${(e: MouseEvent) => this._handleSelect(e, menuItem)}
				@mouseenter=${() => this._handleMenuItemMouseEnter(menuItem)}
				@mouseleave=${() => this._handleMenuItemMouseLeave()}
				@focus=${(e: FocusEvent) => this._handleMenuItemFocused(e, menuItem)}
			>
				${menuItem.type !== 'separator' ? html`
					<div class="label">
						${menuItem.label}
					</div>
				` : ''}
				${menuItem.type === 'checkbox' || menuItem.type === 'radio' ? html`
					<div class="iconArea">
						${menuItem.type === 'checkbox'
							? html`<ffbox-checkbox .checked=${menuItem.checked}></ffbox-checkbox>`
							: html`<ffbox-radio .checked=${menuItem.checked}></ffbox-radio>`}
					</div>
				` : ''}
				${'icon' in menuItem && menuItem.icon ? html`
					<div class="iconArea">
						${menuItem.icon}
					</div>
				` : ''}
				${menuItem.type === 'submenu' ? html`
					<div class=${['iconRightArea', this._openedSubMenuItemPos[menuItem.key ?? -1]?.preferDirection === 'l' ? 'flipped' : ''].filter(Boolean).join(' ')}>
						${unsafeSVG(rightIcon)}
					</div>
				` : ''}
			</div>
		`;
	}

	// 将所有子菜单打平，这样就能使用一个循环渲染所有菜单
	// （Vue 版本需 toRaw 解除响应式代理才能做 === 比较，Lit 直接持有原始引用，无需此步骤）
	private _flattenMenus(): InnerMenu[] {
		const allMenus: InnerMenu[] = [];
		let i = 0;
		const queue = [{
			menu: this.menu,
			menuIndex: i,
			parent: null as InnerMenu | null,
		}];
		while (queue.length) {
			const menu = queue.shift()!;
			allMenus.push(menu);
			for (const menuItem of menu.menu) {
				if (menuItem.type === 'submenu') {
					i++;
					menuItem.key = i;	// menuItem.key 作为子菜单的 menuIndex
					queue.push({
						menu: menuItem.subMenu,
						menuIndex: i,
						parent: menu,
					});
				}
			}
		}
		const ret: InnerMenu[] = [];
		for (const menu of allMenus) {
			ret[menu.menuIndex] = menu;
		}
		return ret;
	}

	private _getMenuItemClassName(menuItem: MenuItem) {
		if (menuItem.type === 'separator') {
			return 'menuSeparator';
		} else {
			let retStr = ['menuItem'];
			if (menuItem.disabled) {
				retStr.push('menuItemDisabled');
			}
			// 优先显示选中，再显示悬浮
			if ('value' in menuItem && this._currentSelectedItem === menuItem.value) {
				retStr.push('menuItemSelected');
			} else {
				if (this._currentHoveredItem === menuItem) {
					retStr.push('menuItemHovered');
				}
				// 若子菜单被打开，则进入子菜单的对应项也要显示悬浮
				if (menuItem.type === 'submenu') {
					if (this._openedSubMenus.includes(menuItem.key!)) {
						retStr.push('menuItemHovered');
					}
				}
			}
			return retStr.join(' ');
		}
	}

	private _getMenuPosition(menu: InnerMenu): StyleInfo {
		// 暂时写死的高度
		const menuItemHeight = 32;
		const menuSeparatorHeight = 9;
		const menuPaddingY = 6;
		let ScreenWidth = document.documentElement.clientWidth;			// 使用 window.innerWidth 也行
		let ScreenHeight = document.documentElement.clientHeight;

		// const span = document.createElement('span');
		// span.style.position = 'fixed';
		// span.style.visibility = 'hidden';
		// span.style.whiteSpace = 'nowrap';
		// span.style.fontSize = '14px';
		// document.body.appendChild(span);
		// const listWidth1 = menu.menu.reduce((prev, curr) => {
		// 	if ('label' in curr) {
		// 		span.textContent = curr.label;
		// 		const width = span.getBoundingClientRect().width;
		// 		return Math.max(width, prev);
		// 	} else {
		// 		return prev;
		// 	}
		// }, 0);
		// document.body.removeChild(span);
		// 使用 14px 字体测量列表最大宽度。以下方法的速度是上面的七八倍
		const canvas = document.createElement('canvas');
		canvas.style.position = 'fixed';
		canvas.style.top = '150px';
		const context = canvas.getContext('2d')!;
		context.font = getComputedStyle(document.body).font.replace(/\d+px/, '14px');
		const listWidth2 = menu.menu.reduce((prev, curr) => {
			if ('label' in curr) {
				const metrics = context.measureText(curr.label);
				context.fillText(curr.label, 0, Math.random() * 150);
				return Math.max(metrics.width, prev);
			} else {
				return prev;
			}
		}, 0);

		const listWidth = Math.min(listWidth2 + 86, Math.min(window.innerWidth, 800));	// 86 包含 padding、左图标、右三角、scrollbar
		const listHeight = menu.menu.reduce((prev, curr) => prev + (curr.type === 'separator' ? menuSeparatorHeight : menuItemHeight), 0) + menuPaddingY * 2;
		const _triggerRect = this._openedSubMenuItemPos[menu.menuIndex] || this.triggerRect || { xMin: 0, yMin: 0, xMax: listWidth, yMax: 0 };
		const isHorizontal = this._openedSubMenuItemPos[menu.menuIndex] !== undefined;	// 第一个菜单使用上下弹出
		let finalPosition: StyleInfo = {};
		// 计算水平位置
		if (isHorizontal) {
			// 左右弹出
			const direction = ('preferDirection' in _triggerRect && _triggerRect.preferDirection === 'l') ? 'l' : 'r';
			const finalLeft = direction === 'r' ? Math.min(_triggerRect.xMax, ScreenWidth - listWidth) : Math.max(_triggerRect.xMin - listWidth, 0);
			finalPosition = {
				left: `${finalLeft}px`,
				width: `${listWidth}px`,
			};
		} else {
			// 上下弹出
			const finalWidth = Math.max(listWidth, _triggerRect.xMax - _triggerRect.xMin);
			const centralX = Math.max(finalWidth / 2, Math.min((_triggerRect.xMax + _triggerRect.xMin) / 2, ScreenWidth - finalWidth / 2));
			finalPosition = {
				left: `${centralX - finalWidth / 2}px`,
				width: `${finalWidth}px`,
			};
		}

		// 计算垂直位置
		let upperSpace = isHorizontal ? _triggerRect.yMax : _triggerRect.yMin;
		let lowerSpace = ScreenHeight - (isHorizontal ? _triggerRect.yMin : _triggerRect.yMax);
		if (upperSpace >= lowerSpace) {
			// 上方空间更大，往上弹出
			if (listHeight <= upperSpace) {
				finalPosition = { ...finalPosition, height: `${listHeight}px`, bottom: `${ScreenHeight - upperSpace}px` };
			} else {
				finalPosition = { ...finalPosition, height: `${upperSpace}px`, top: `${0}px` };
			}
		} else {
			// 下方空间更大，往下弹出
			if (listHeight <= lowerSpace) {
				finalPosition = { ...finalPosition, height: `${listHeight}px`, top: `${ScreenHeight - lowerSpace}px` };
			} else {
				finalPosition = { ...finalPosition, height: `${lowerSpace}px`, bottom: `${0}px` };
			}
		}

		// 确定位置
		return finalPosition;
	}

	private _getMenuByItem(menuItem: MenuItem) {
		for (const [keyInFlattened, menu] of Object.entries(this._flattenedMenus)) {
			for (const [keyInMenu, _menuItem] of Object.entries(menu.menu)) {
				if (_menuItem === menuItem) {
					return {
						menu,
						indexInFlattened: Number(keyInFlattened),
						indexInMenu: Number(keyInMenu),
					};
				}
			}
		}
	}
	private _getMenuAndItemByValue(value: any) {
		for (const menu of Object.values(this._flattenedMenus)) {
			for (const menuItem of menu.menu) {
				if ('value' in menuItem && menuItem.value === value) {
					return {
						menu,
						menuItem,
					}
				}
			}
		}
	}

	// 计算子菜单的显示位置，并更新 openedSubMenuItemPos
	private _calcSubMenuPosition = async (menuIndex: number) => {
		// 已计算位置，则直接跳过
		if (this._openedSubMenuItemPos[menuIndex]) {
			return;
		}
		// 当前菜单父级 MenuItem 未计算位置，则通过 menuIndex 找到父级菜单
		// 然后检查这个父级菜单的父级 MenuItem 有无计算位置。若有，则直接找 menuItem，找到 DOM，计算出结果
		// 否则递归进入父级菜单
		const menu = this._flattenedMenus[menuIndex];
		const parentMenu = menu.parent;
		if (!parentMenu) {
			// 当菜单是顶层菜单时，没有父级菜单。getMenuPosition 会直接使用 triggerRect
			return;
		}
		if (!this._openedSubMenuItemPos[parentMenu.menuIndex]) {
			// 父级菜单的父级 MenuItem 未计算位置
			await this._calcSubMenuPosition(parentMenu.menuIndex);	// 不加 await 会导致最后一个子菜单的位置计算错误，神奇
			// 等待父级菜单的新位置渲染到 DOM 后，再读取其内部 MenuItem 的 rect，
			// 否则读到的是父级菜单尚未定位时的旧位置（堆叠在第一个菜单上），导致下级子菜单位置错误
			await this.updateComplete;
		}
		// 父级菜单的父级 MenuItem 已计算位置，故直接在父级菜单找到 MenuItem，找到 DOM，计算结果
		const parentIndexInFlattened = parentMenu.menuIndex;
		const parentIndexInMenu = parentMenu.menu.findIndex((menuItem) => menuItem.type === 'submenu' && menuItem.key === menuIndex);
		const menuElem = this._menuElemRefs[parentIndexInFlattened] as HTMLDivElement;
		const menuItemElem = menuElem.children[parentIndexInMenu];
		menuItemElem.scrollIntoView({
			behavior: 'instant', block: 'center', inline: 'center'
		});
		// 已从父菜单中找到 menuItemElem 所在的位置并滚动到画面内，依此计算 submenu 的显示位置
		const menuItemElemRect = menuItemElem.getBoundingClientRect();
		this._openedSubMenuItemPos[menuIndex] = {
			xMin: menuItemElemRect.x,
			yMin: menuItemElemRect.y,
			xMax: menuItemElemRect.x + menuItemElemRect.width,
			yMax: menuItemElemRect.y + menuItemElemRect.height,
			preferDirection: 'r',
		};
		// Lit 的 @state 只追踪属性整体重赋值，原地新增 key 不会触发重渲染（Vue 的 reactive 则会），
		// 须整体重赋值让子菜单位置生效，否则子菜单停留在 _getMenuPosition 的 triggerRect 回退位置上（全部堆叠）
		this._openedSubMenuItemPos = { ...this._openedSubMenuItemPos };
	};

	// hover 到项目上时，使用此函数计算 tooltip 显示位置并展示
	private _showTooltip = (menuItem: MenuItem) => {
		// 计算 tooltip 打开位置
		if (menuItem.type !== 'separator' && menuItem.tooltip) {
			const { menu: _menu, indexInFlattened, indexInMenu } = this._getMenuByItem(menuItem)!;
			let position: Record<string, string> = {};
			const menuElem = this._menuElemRefs[indexInFlattened] as HTMLDivElement;
			if (!menuElem) {
				return;	// 操作特别快时，由 currentHoveredItem 变化延迟触发该函数时，菜单可能已经被销毁
			}
			const menuItemElem = menuElem.children[indexInMenu];
			const menuItemElemRect = menuItemElem.getBoundingClientRect();
			const screenHeight = document.documentElement.clientHeight;			// 使用 window.innerWidth 也行
			// 计算水平方向
			const leftSpace = menuItemElemRect.left;
			if (this._openedSubMenuItemPos[indexInFlattened]?.preferDirection === 'l' || leftSpace < 220) {
				// 当前菜单是在上一级菜单左侧打开时，或者左侧空间太小时，在右侧弹出
				position = {
					...position,
					left: `${menuItemElemRect.left + menuItemElemRect.width + 12}px`,
				};
			} else {
				position = {
					...position,
					right: `calc(100% - ${menuItemElemRect.left - 12}px)`,
				};
			}
			// 计算垂直方向（若 item 垂直位置在窗口上方，那么指定 top，否则指定 bottom）
			if (menuItemElemRect.top + menuItemElemRect.height / 2 < screenHeight / 2) {
				position = {
					...position,
					top: `${menuItemElemRect.top}px`,
				};
			} else {
				position = {
					...position,
					bottom: `calc(100% - ${menuItemElemRect.top + menuItemElemRect.height}px)`
				};
			}
			FFBoxTooltip.show({
				content: menuItem.tooltip,
				style: position as any,
			});
		}
	}

	// 鼠标选择、键盘 Enter，或菜单为 select 模式时键盘移动焦点时均触发此函数，向上层报告
	// （对应 Vue 版 Menu.tsx 的 handleItemSelect，原封装层逻辑已合并至本组件）
	private _onItemSelect = (event: Event, menuItem: MenuItem) => {
		if (!('value' in menuItem) || menuItem.disabled) {
			return;
		}
		/**
		 * 菜单组件鼠标弹起、方向键、Enter 键，只要 menuItem 有 value，且有效（没有 disabled）都会触发 _onItemSelect
		 * 此时需要判断：1. 是否向上触发 onSelect；2. 是否需要关闭菜单；3. 是否需要调用 menuItem 自身的 onClick
		 * 对于 action 类型的菜单，只有点击或 Enter 键，才会触发 onSelect（目前默认关闭菜单）。而 onClick 是否要触发则取决于 onSelect
		 * 对于 select 类型的菜单，如果定义了 onClick，它就是一个例外的 action，在点击或 Enter 键的情况下在此处处理 onClick（目前默认关闭菜单）。否则 Enter、方向键都会触发 onSelect，但只有点击、Enter 会关闭菜单
		 */
		const isClickEvent = event.type === 'mouseup' || (event.type === 'keydown' && (event as KeyboardEvent).key === 'Enter');
		if (this.type === 'action') {
			if (isClickEvent) {
				const result = this.onSelect ? this.onSelect(event, menuItem.value, menuItem.type !== 'normal' ? menuItem.checked : undefined) : false;
				if (result === false) {
					(menuItem.onClick || (() => {}))(event, menuItem.value);
				}
				this.close();
			}
		} else if (this.type === 'select') {
			if (menuItem.onClick) {
				if (isClickEvent) {
					menuItem.onClick(event, menuItem.value);
				}
			} else {
				(this.onSelect || (() => {}))(event, menuItem.value, menuItem.type !== 'normal' ? menuItem.checked : undefined);
				if (isClickEvent) {
					this.close();
				}
			}
		}
	}

	private _handleSelect = (e: MouseEvent | KeyboardEvent, menuItem: MenuItem) => {
		e.stopPropagation();	// 防止触发 mask 的 onCancel
		if ('value' in menuItem) {
			this._onItemSelect(e, menuItem);
		}
	};

	private _handleMenuItemMouseEnter = (menuItem: MenuItem) => {
		this._setHoveredItem(menuItem);
	};
	private _handleMenuItemMouseLeave = () => {
		this._setHoveredItem(undefined);
	};

	private _handleMenuItemFocused = (e: FocusEvent, menuItem: MenuItem) => {
		this._setHoveredItem(menuItem);
		this.returnFocus?.(e);
	};

	// 根据当前 hover 项确定子菜单的打开状态、tooltip 的显隐
	// （对应 Vue 版对 currentHoveredItem 的 watch，改为在 mouseenter / focus / mouseleave 中显式调用）
	private _setHoveredItem = (newItem: MenuItem | undefined) => {
		const oldItem = this._currentHoveredItem;
		this._currentHoveredItem = newItem;
		if (newItem !== undefined) {
			const found = this._getMenuByItem(newItem);
			if (!found) {
				return;
			}
			const { menu, indexInFlattened, indexInMenu } = found;
			const newOpenedKeys = [menu.menuIndex];
			let current = menu;
			// 打开的菜单为 [...所有父亲, 当前菜单]
			while (current.parent) {
				current = current.parent;
				newOpenedKeys.unshift(current.menuIndex);
			}
			if (newItem.type === 'submenu') {
				// 打开的菜单为 [...所有父亲, 当前菜单, 子菜单]
				newOpenedKeys.push(newItem.key!);
				// 记录子菜单项的位置
				const menuElem = this._menuElemRefs[indexInFlattened] as HTMLDivElement;
				const menuItemElem = menuElem.children[indexInMenu];
				const menuItemElemRect = menuItemElem.getBoundingClientRect();
				const currentPreferDirection = this._openedSubMenuItemPos[menu.menuIndex]?.preferDirection || 'r';
				this._openedSubMenuItemPos[newItem.key!] = {
					xMin: menuItemElemRect.x,
					yMin: menuItemElemRect.y,
					xMax: menuItemElemRect.x + menuItemElemRect.width,
					yMax: menuItemElemRect.y + menuItemElemRect.height,
					preferDirection: currentPreferDirection === 'r'
						? (menuItemElemRect.x + menuItemElemRect.width * 1.5 > window.innerWidth ? 'l' : 'r')
						: (menuItemElemRect.x < menuItemElemRect.width * 0.5 ? 'r' : 'l'),
				};
				this._openedSubMenuItemPos = { ...this._openedSubMenuItemPos };	// 同 _calcSubMenuPosition：原地 mutation 不触发 Lit 重渲染
			}
			if (JSON.stringify(newOpenedKeys) !== JSON.stringify(this._openedSubMenus)) {
				this._openedSubMenus = newOpenedKeys;
				const newPos = { ...this._openedSubMenuItemPos };
				for (const key of Object.keys(newPos)) {
					if (!newOpenedKeys.includes(+key)) {
						delete newPos[+key];
					}
				}
				this._openedSubMenuItemPos = newPos;
			}
			setTimeout(() => {
				// 初次加载时，menuElemRefs 未准备好，因此添加 setTimeout 应对此情况
				this._showTooltip(newItem);
			}, 0);
		}
		if ((newItem === undefined || !('tooltip' in newItem)) && oldItem !== undefined) {
			FFBoxTooltip.hide();
		}
	};

	// 键盘操作响应
	private _keydownListener = (e: KeyboardEvent) => {
		// 关闭菜单
		if (e.key === 'Escape') {
			this._handleCancel(e);
		}
		let menuItem = this._currentHoveredItem;
		// 动作
		if (e.key === 'Enter') {
			if (menuItem) {
				this._handleSelect(e, menuItem);
			}
		}
		if (!menuItem) {
			// 未 hover 时，上下方向，反向移动一位，以便后面检测上下方向的代码移到正确位置
			if (e.key === 'ArrowDown' || e.key === 'Home') {
				menuItem = Object.values(this._flattenedMenus)[0].menu[Object.values(this._flattenedMenus)[0].menu.length - 1];
			} else if (e.key === 'ArrowUp' || e.key === 'End') {
				menuItem = Object.values(this._flattenedMenus)[0].menu[0];
			} else {
				// 其他按键冒泡到上层
				this.onKeyDown?.(e);
			}
		}
		if (!menuItem) {
			return;
		}
		// 检测上下方向，切换菜单项焦点
		const { menu, indexInFlattened, indexInMenu } = this._getMenuByItem(menuItem)!;
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();	// 防止多余的滚动
			// 找到菜单 DOM
			const menuElem = this._menuElemRefs[indexInFlattened] as HTMLDivElement;
			// 找下一个/上一个元素，直到可以 focus
			let currentIndex = indexInMenu;
			do {
				if (e.key === 'ArrowUp') {
					currentIndex = currentIndex === 0 ? menu.menu.length - 1 : currentIndex - 1;
				} else {
					currentIndex = currentIndex === menu.menu.length - 1 ? 0 : currentIndex + 1;
				}
				if (menu.menu[currentIndex].type !== 'separator') {
					break;
				}
			} while (currentIndex !== indexInMenu);	// 找了一圈没找到则退出循环
			(menuElem.children[currentIndex] as HTMLElement).focus();
			if (this.type === 'select') {
				this._handleSelect(e, menu.menu[currentIndex]);
			}
		}
		if (e.key === 'Home' || e.key === 'End') {
			// 找到菜单 DOM
			const menuElem = this._menuElemRefs[indexInFlattened] as HTMLDivElement;
			const index = e.key === 'Home' ? 0 : menuElem.children.length - 1;
			(menuElem.children[index] as HTMLElement).focus();
			if (this.type === 'select') {
				this._handleSelect(e, menu.menu[index]);
			}
		}
		// 检测左右方向，若本菜单有动作，则不冒泡到上层；否则向上触发
		if (e.key === 'ArrowLeft') {
			if (menu.parent) {
				// 焦点回到父级的进入子菜单的项
				const parentDOM = this._menuElemRefs[menu.parent.menuIndex];
				const menuItemIndex = menu.parent.menu.findIndex((menuItem) => menuItem.type === 'submenu' && menuItem.key === menu.menuIndex);
				(parentDOM.children[menuItemIndex] as HTMLElement).focus();
			} else {
				this.onKeyDown?.(e);
			}
		} else if (e.key === 'ArrowRight') {
			if (menuItem.type === 'submenu') {
				// 焦点进入子菜单的 props 选中项或第一项
				const childDOM = this._menuElemRefs[menuItem.key!];
				const activeIndex = menuItem.subMenu.findIndex((menuItem) => 'value' in menuItem && menuItem.value === this._currentSelectedItem);
				const finalIndex = activeIndex !== -1 ? activeIndex : 0;
				(childDOM.children[finalIndex] as HTMLElement).focus();
				if (this.type === 'select') {
					this._handleSelect(e, menuItem.subMenu[finalIndex]);
				}
			} else {
				this.onKeyDown?.(e);
			}
		}
	}

	private _handleCancel = (event: Event) => {
		const result = (this.onCancel || (() => {}))(event);
		if (result !== false) {
			this.close();
		}
		return result;
	}

	/** 关闭前给个机会展示退出动画（对应 Vue 版 exposed.preClose） */
	preClose() {
		this._leaving = true;
	}

	/**
	 * 关闭菜单，播完离场动画后组件自行从 DOM 移除
	 * （对应 Vue 版 Menu.tsx 的 handleClose：同一次 render 内第二次调用时，需判断是否已经被卸载）
	 */
	close() {
		if (!this._unmounted) {
			this.preClose();
			(this.onClose || (() => {}))();
			this._unmounted = true;
			setTimeout(() => {
				this.remove();
			}, 150);
		}
	}

	/** 由外部（如 DropdownInput）转发键盘事件（对应 Vue 版 exposed.triggerKeyboardEvent） */
	triggerKeyboardEvent(event: KeyboardEvent) {
		this._keydownListener(event);
	}

	/** 更改选中值并主动反馈至菜单（对应 Vue 版 exposed.setSelectedValue） */
	setSelectedValue(value: any) {
		this._currentSelectedItem = value;
	}
}

function _detectTheme(): Theme {
	const provider = document.querySelector<HTMLElement & { theme: string }>('ffbox-theme-provider');
	if (provider) return provider.theme === 'dark' ? 'dark' : 'light';
	return 'light';
}

FFBoxMenu.showMenu = function (options: MenuOptions): FFBoxMenuHandle {
	const el = document.createElement('ffbox-menu') as FFBoxMenu;
	el.menu = options.menu;
	el.type = options.type || 'action';
	el.selectedValue = options.selectedValue;
	if (options.triggerRect) {
		el.triggerRect = options.triggerRect;
	} else if (options.triggerElem) {
		const rect = options.triggerElem.getBoundingClientRect();	// 与主程序调用点手工换算 element rect 的写法等价
		el.triggerRect = { xMin: rect.left, yMin: rect.top, xMax: rect.right, yMax: rect.bottom };
	}
	el.onSelect = options.onSelect;
	el.onCancel = options.onCancel;
	el.onClose = options.onClose;
	el.onKeyDown = options.onKeyDown;
	el.returnFocus = options.returnFocus;
	el.theme = _detectTheme();	// 若容器在 theme-provider 内，@consume 会用 provider 的值覆盖此处
	const container = options.container || document.body;
	container.appendChild(el);
	return {
		menu: el,
		close: () => el.close(),
		triggerKeyboardEvent: (event) => el.triggerKeyboardEvent(event),
		setSelectedValue: (value) => el.setSelectedValue(value),
	};
};

export { getMenuItemByValue, type MenuItem, type NarrowedMenuItem } from './menu-item.js';

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-menu': FFBoxMenu;
	}
}

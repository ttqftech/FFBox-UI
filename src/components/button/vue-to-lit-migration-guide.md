# Vue → Lit 组件对照指南（以 Button 为例）

## 一、整体架构对比

| 概念 | Vue 版本 | Lit 版本 |
|------|----------|----------|
| **组件定义方式** | 函数式组件 `FunctionalComponent<ButtonProps>` | 类组件 `class FfboxButton extends LitElement` |
| **注册方式** | 由 Vue 的模板系统自动处理 | `@customElement('ffbox-button')` 装饰器注册为**原生 Web Component** |
| **Props 定义** | TypeScript 接口 `ButtonProps` | 类属性 + `@property()` 装饰器 |
| **模板** | JSX `<button>...</button>` | `html` 模板字面量 `` html`<button>...</button>` `` |
| **样式** | 外部 CSS Modules (`Button.module.less`) | 组件内 `static styles = css\`...\`` |
| **插槽** | `ctx.slots.default` | `<slot></slot>` |

**核心区别**：Vue 组件只在 Vue 的运行时内生效；而 Lit 组件最终产出的是**浏览器原生的 Custom Element**（即 `<ffbox-button>` 标签），可以在任何框架甚至纯 HTML 中使用。

---

## 二、组件注册

```ts
// Vue — 无需手动注册，导出后由父组件 import 使用
const ButtonComponent: FunctionalComponent<ButtonProps> = (props, ctx) => { ... }
export default ButtonComponent;

// Lit — @customElement 装饰器将类注册为浏览器原生标签
@customElement('ffbox-button')
export class FfboxButton extends LitElement { ... }
```

- Vue：组件是 Vue 运行时的概念，通过 `import` + 模板引用使用。
- Lit：`@customElement('ffbox-button')` 调用底层 `customElements.define('ffbox-button', FfboxButton)`，注册后浏览器就认识 `<ffbox-button>` 这个标签了，**不需要 import 到使用处**（当然 TypeScript 类型仍需 import）。

---

## 三、Props / 属性

```ts
// Vue — 纯 TypeScript 接口，运行时由 Vue 处理
export interface ButtonProps {
	disabled?: boolean;
	onClick?: (event: MouseEvent) => any;
	type?: ButtonType;
	size?: 'small' | 'normal' | 'large';
}

// Lit — 类属性 + @property() 装饰器
@property({ reflect: true }) type: ButtonType = 'normal';
@property({ reflect: true }) size: ButtonSize = 'normal';
@property({ reflect: true, type: Boolean }) disabled = false;
@property({ reflect: true, attribute: 'data-theme' }) theme: 'light' | 'dark' = 'light';
```

关键对应：

| Vue Props | Lit `@property()` | 说明 |
|-----------|-------------------|------|
| `disabled?: boolean` | `@property({ reflect: true, type: Boolean }) disabled = false` | `type: Boolean` 告诉 Lit 做布尔属性转换（有属性 = true）；`reflect: true` 表示属性变化时**同步反映到 HTML attribute 上**（即 DOM 上能看到 `disabled` 属性） |
| `type?: ButtonType` | `@property({ reflect: true }) type: ButtonType = 'normal'` | 默认类型是 String，`reflect: true` 让 `<ffbox-button type="primary">` 的 attribute 与 JS 属性保持同步 |
| `onClick?: (event: MouseEvent) => any` | ❌ 不存在 | Lit 不用回调 prop，而是用**自定义事件**（见下文事件部分） |
| — | `@property({ reflect: true, attribute: 'data-theme' }) theme` | `attribute: 'data-theme'` 将 JS 属性 `theme` 映射到 HTML attribute `data-theme`，这样 CSS 可以用 `[data-theme="dark"]` 选择器 |

**理解要点**：在 Vue 中，props 是"从父组件传入的数据"；在 Lit 中，`@property()` 既是**JS 属性**也是 **HTML attribute**（双向映射），因为 Lit 组件是原生 DOM 元素，外部可以通过 `element.type = 'primary'` 或 `element.setAttribute('type', 'primary')` 两种方式设置。

---

## 四、模板 / 渲染

```tsx
// Vue JSX
const ButtonComponent: FunctionalComponent<ButtonProps> = (props, ctx) => {
	return (
		<button
			data-color_theme={colorTheme.value}
			class={getButtonClass(type, disabled, size)}
			disabled={disabled}
			onClick={(event) => { (onClick || (() => {}))(event); event.stopImmediatePropagation() }}
			{...restProps}
		>
			{ ctx.slots.default && h(ctx.slots.default) }
		</button>
	)
}
```

```ts
// Lit
render() {
	const typeClass = this.type !== 'normal' ? this.type : '';
	const sizeClass = this.size !== 'normal' ? this.size : '';
	const classes = ['button', typeClass, sizeClass].filter(Boolean).join(' ');

	return html`
	<button
		class=${classes}
		?disabled=${this.disabled}
		@click=${this._handleClick}
	>
		<slot></slot>
	</button>
	`;
}
```

对应关系：

| Vue JSX | Lit `html` 模板 | 说明 |
|---------|-----------------|------|
| `class={getButtonClass(...)}` | `class=${classes}` | 动态 class，逻辑一样，只是写法不同 |
| `disabled={disabled}` | `?disabled=${this.disabled}` | **`?` 前缀**是 Lit 的布尔属性语法：`?attr=${bool}` — true 时添加 attribute，false 时移除 |
| `onClick={handler}` | `@click=${this._handleClick}` | **`@` 前缀**是 Lit 的事件绑定语法，等价于 Vue 的 `@click` / `onClick` |
| `{ ctx.slots.default && h(ctx.slots.default) }` | `<slot></slot>` | Vue 的具名插槽 → Lit 的 `<slot>` 原生插槽。Lit 使用浏览器原生的 Shadow DOM slot 机制 |
| `{...restProps}` | ❌ 不存在 | Vue 的属性透传；Lit 中未使用的 attribute 会自动通过 Shadow DOM 的 attribute 变化观察机制处理 |

**理解要点**：Lit 的 `html` 模板字面量是带特殊语法的 tagged template literal：
- `@event=${handler}` — 事件监听
- `?attr=${boolean}` — 布尔属性
- `.prop=${value}` — 设置 JS 属性（不反映到 HTML attribute）
- `${expression}` — 文本/属性插值

---

## 五、事件处理

```ts
// Vue — 通过 props 回调
onClick?: (event: MouseEvent) => any;
// 使用：
onClick={(event) => { (onClick || (() => {}))(event); event.stopImmediatePropagation() }}
// 父组件：
<Button onClick={handleClick}>...</Button>
```

```ts
// Lit — 通过自定义事件
private _handleClick(e: MouseEvent) {
	if (this.disabled) return;
	e.stopImmediatePropagation();
	this.dispatchEvent(new CustomEvent('ffbox-click', {
		detail: e,
		bubbles: true,
		composed: true,
	}));
}
// 父组件/外部使用：
// <ffbox-button @ffbox-click=${handler}></ffbox-button>
// 或 JS: element.addEventListener('ffbox-click', handler)
```

**这是最大的思维转变**：

| | Vue | Lit |
|--|-----|-----|
| **方式** | 父传回调函数 (props) | 子组件 dispatch 自定义事件 |
| **方向** | 父 → 子（传入函数） | 子 → 父（冒泡事件） |
| **使用** | `<Button onClick={fn}>` | `element.addEventListener('ffbox-click', fn)` |
| **跨框架** | ❌ 只在 Vue 内有效 | ✅ 原生 DOM 事件，任何环境都能监听 |

`bubbles: true` 让事件可以冒泡，`composed: true` 让事件可以穿透 Shadow DOM 边界传到外部——这两个对 Web Component 非常重要。

---

## 六、样式

```ts
// Vue — 外部 Less 文件 + CSS Modules
import css from './Button.module.less';
// 使用：css['button'], css['primary'], css['disabled'] ...

// Lit — 组件内 static styles
static styles = css`
	:host { display: inline-block; }
	.button { ... }
	:host([disabled]) .button { pointer-events: none; opacity: 0.6; }
	:host([data-theme="dark"]) .button { ... }
	...
`;
```

对应关系：

| Vue | Lit | 说明 |
|-----|-----|------|
| `css['button']` | `.button` | Vue 用 CSS Modules 做局部作用域；Lit 用 **Shadow DOM** 天然隔离 |
| 外部 `.less` 文件 | `static styles = css\`...\`` | Lit 把样式写在组件内部，`css` tag 会做预处理和优化 |
| `data-color_theme` 属性 + CSS 选择器 | `:host([data-theme="dark"])` | Vue 通过 `inject` 注入主题，设置 `data-color_theme` 属性；Lit 用 `:host()` 选择器直接根据 host 元素的 attribute 切换样式 |
| — | `:host` | `:host` 选择器选中**组件自身**（即 `<ffbox-button>` 元素），等价于 Vue 中给组件根元素设置样式 |
| — | `:host([disabled])` | 选中**带有 disabled 属性的组件自身**，这是 Shadow DOM 特有的选择器 |

---

## 七、类型声明

```ts
// Lit 末尾的类型声明
declare global {
	interface HTMLElementTagNameMap {
		'ffbox-button': FFBoxButton;
	}
}
```

这行让 TypeScript 知道 `document.createElement('ffbox-button')` 返回的是 `FFBoxButton` 实例，以及 `querySelector` 等能返回正确类型。Vue 不需要这个，因为 Vue 组件不是 DOM 元素。

---

## 八、速查对照表

| Vue 概念 | Lit 对应 | 一句话说明 |
|----------|----------|-----------|
| `defineComponent` / `FunctionalComponent` | `class extends LitElement` | 类 vs 函数 |
| `props` | `@property()` 装饰器 | 属性即 DOM attribute |
| `emit` / 回调 prop | `dispatchEvent(new CustomEvent(...))` | 事件冒泡 vs 函数传入 |
| `slots` | `<slot>` | 原生 Shadow DOM 插槽 |
| `<template>` / JSX | `html` tagged template | 模板字面量 |
| `scoped style` / CSS Modules | `static styles` + Shadow DOM | 天然隔离 |
| `inject` / `provide` | 属性 / CSS 自定义属性 | 无依赖注入，用 attribute 或 CSS 变量 |
| `v-bind:class` | `class=${expr}` | 插值绑定 |
| `v-on:click` | `@click=${handler}` | `@` 前缀 |
| `v-bind:disabled` | `?disabled=${bool}` | `?` 前缀表示布尔属性 |
| 组件 import | `@customElement('tag-name')` | 自动注册为全局标签 |

---

**总结一句话**：Vue 组件是框架内的抽象，Lit 组件是**浏览器原生的 DOM 元素**。所以 Lit 的所有设计都在向 Web 标准靠拢——属性就是 DOM 属性，事件就是 DOM 事件，样式就是 Shadow DOM 样式，插槽就是原生 `<slot>`。理解了"Lit 组件 = 原生 HTML 元素"这个核心，其他所有差异就都顺理成章了。

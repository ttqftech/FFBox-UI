# FFBoxThemeProvider 设计文档

## 概述

`ffbox-theme-provider` 是 FFBox-UI 主题系统的核心。它基于 `@lit/context` 实现，通过 Lit Context 协议将主题值（`'light'` | `'dark'`）自动传递给子树中所有消费组件，无需逐层手动传递 props/attributes。

## 架构

```
ffbox-theme-provider.ts
  ├── ContextRoot.attach(document.body)   ← 模块级代码，解决时序问题
  ├── @provide({ context: themeContext }) ← 向子树提供主题值
  └── <slot></slot>                       ← 透传子内容

ffbox-button.ts（及其他消费组件）
  ├── import '../theme-provider/ffbox-theme-provider.js'  ← 自动依赖 Provider
  └── @consume({ context: themeContext, subscribe: true }) ← 订阅主题变化
```

## 数据流

```
用户代码: themeProvider.theme = 'dark'
  │
  ├─ @property setter → Lit reactivity → willUpdate → render
  └─ @provide setter → ContextProvider.setValue('dark')
       └─ ValueNotifier.updateObservers()
            └─ 遍历所有订阅的 callback
                 └─ Consumer 的 callback: this.theme = 'dark'
                      ├─ @property setter → Lit reactivity → render
                      └─ reflect: true → setAttribute('data-theme', 'dark')
                           └─ CSS :host([data-theme="dark"]) 生效
```

## 踩坑记录

### 坑 1：装饰器执行顺序导致 @provide 失效

**现象**：使用 `@provide` + `@consume` 装饰器后，切换主题时 Consumer 的 `theme` 属性不更新。

**排查过程**：

在 Provider 的 `willUpdate` 中添加 `console.log`，发现 `willUpdate` 确实触发了。在 Consumer 的 `callback` 中添加 `console.log`，发现 callback 从未被调用。说明 Provider 发出了通知，但 Consumer 没有收到。

**根因**：

TypeScript `experimentalDecorators` 模式下，`__decorate` 的执行机制：

1. `@property` 返回一个新描述符（getter/setter），但**尚未** `Object.defineProperty` 到原型上
2. `@provide` 紧接着执行，此时 `getOwnPropertyDescriptor` 拿到的是 `undefined`
3. `@provide` 创建了自己的 WeakMap setter 并 `Object.defineProperty` 到原型
4. `__decorate` 最后又用 `@property` 的描述符**覆盖**了 `@provide` 的 setter

结果：`@provide` 的 `setValue()` 调用被彻底丢失。

**解决**：

实测发现，在**确保 Provider 先于 Consumer 注册**的前提下，`@provide` 和 `@consume` 装饰器可以正常工作。问题的真正根因是坑 2（注册顺序），而非装饰器本身。

### 坑 2：组件注册顺序导致 Consumer 找不到 Provider

**现象**：Provider 的 `willUpdate` 触发了，但 Consumer 的 callback 没响应。

**排查过程**：

1. 在 `window` 上监听 `context-request` 事件，发现事件**确实被派发**了
2. 事件的 `composedPath` 显示经过了 `ffbox-theme-provider` 元素
3. 但事件**没有被 stopPropagation**，说明 Provider 的 ContextProvider 监听器没有处理它

**根因**：

`ffbox-ui-autoregister.ts` 原来的导入顺序：

```ts
import './components/button/ffbox-button.js';      // Consumer 先注册！
import './components/switch/ffbox-switch.js';
// ...
import './components/theme-provider/ffbox-theme-provider.js';  // Provider 最后注册！
```

`customElements.define()` 调用时会**同步升级** DOM 中已有的同名元素：

1. `define('ffbox-button', ...)` → 所有 `<ffbox-button>` 立即升级 → 构造函数运行 → `ContextConsumer.hostConnected()` → 派发 `context-request` 事件
2. 但此时 `<ffbox-theme-provider>` 还是 `HTMLUnknownElement`，ContextProvider 的监听器根本不存在
3. 事件无人接收，冒泡到 window 后丢失
4. 后来 Provider 终于注册了，但 Consumer 的 `context-request` 事件已经错过，`subscriptions` 为空
5. 切换主题时 `setValue()` → `updateObservers()` → 订阅列表空 → 无人通知

**解决**：

使用 `ContextRoot`（见坑 3），并让每个 Consumer 组件自动 import Provider（见坑 4）。

### 坑 3：ContextRoot 解决时序问题

**背景**：

`@lit/context` 官方文档在 Known Issues 章节中明确提到了 **"Late upgraded Context Providers"** 问题：

> In some cases you might have a context providing element that is upgraded late. LightDOM content below this provider may end up requesting a context that is currently not provided by any provider.

官方提供的解决方案是 `ContextRoot`：

```ts
import { ContextRoot } from '@lit/context';
const root = new ContextRoot();
root.attach(document.body);
```

`ContextRoot` 的工作原理：

1. 拦截所有未被满足的 `context-request` 事件，缓存起来
2. 当 `ContextProvider` 连接时派发 `context-provider` 事件
3. `ContextRoot` 收到后，**重新派发**之前缓存的 `context-request`，让 Provider 有机会处理

**实现**：

将 ContextRoot 初始化内联到 `ffbox-theme-provider.ts` 的模块级代码中，通过 `globalThis.__ffbox_context_root_attached` 标志保证只执行一次：

```ts
if (typeof globalThis.__ffbox_context_root_attached === 'undefined') {
    globalThis.__ffbox_context_root_attached = true;
    if (typeof document !== 'undefined' && document.body) {
        new ContextRoot().attach(document.body);
    }
}
```

### 坑 4：单组件引入时 Provider 未注册

**现象**：只 `import 'ffbox-button'` 时，主题切换不响应。

**根因**：

只导入 Consumer 不导入 Provider 时，`<ffbox-theme-provider>` 元素没有被 `customElements.define()`，DOM 中它是 `HTMLUnknownElement`。ContextRoot 解决的是**时序问题**（Provider 注册晚于 Consumer），不是**缺失问题**（Provider 根本没注册）。

**解决**：

让每个 Consumer 组件自动 import theme-provider：

```ts
// ffbox-button.ts
import '../theme-provider/ffbox-theme-provider.js';  // 自动依赖
```

这样 `import 'ffbox-button'` 就会连带注册 Provider，用户无需手动导入。

## 社区反馈

### GitHub Issues

| Issue | 状态 | 内容 |
|-------|------|------|
| [#4618](https://github.com/lit/lit/issues/4618) | **Open** | Context not being passed to parent slot consumer（slot 场景的时序问题） |
| [#3251](https://github.com/lit/lit/issues/3251) | Closed | ContextProvider added after hostConnected does not work with ContextRoot |
| [#3319](https://github.com/lit/lit/issues/3319) | Closed | Context provider controller can't be created after element is connected |
| [#3833](https://github.com/lit/lit/issues/3833) | Closed | ContextRoot fails for consumers in nested shadowRoots |

### 关键评论

- **@vlasaAndrei**（2026-03-21，#4618）：
  > `context-request`s were also sent before the `context-provider` was registered. Adding the export for the context provider component first in the `index.ts` file would have fixed it but that seemed brittle to me.

- **@justinfagnani**（Lit 团队核心成员，#4618）：
  > You need to attach the ContextRoot to the root of your app that's upgraded before anything else. You can attach it to `document.body` too.
  >
  > ```ts
  > import {ContextRoot} from "@lit/context"
  > const contextRoot = new ContextRoot();
  > contextRoot.attach(document.body);
  > ```

- **@stevematney**（2025-09-26，#4618）：
  > It took me a long time to find this post. This piece of documentation should be much more accessible when reading about Contexts.

- Lit 团队曾在工程会议上讨论过**自动将 ContextRoot 应用到 document/window**，但尚未实施。

## @lit/context 源码分析

### createContext

```js
function createContext(key) { return key; }
```

`createContext('ffbox-theme')` 就是返回字符串 `'ffbox-theme'` 本身。它只是一个事件匹配的 key。

### ContextProvider

构造时：
1. 创建 `ValueNotifier` 存储初始值
2. `attachListeners()` — 在 host 元素上监听 `context-request` 和 `context-provider` 事件
3. `host.addController(this)` — 注册为 ReactiveController

`hostConnected()` 时：
- 派发 `context-provider` 事件，通知 DOM 树"我能提供此上下文"

`onContextRequest(ev)` 时：
- 检查 `ev.context` 是否匹配
- `ev.stopPropagation()` 阻止事件继续冒泡
- `addCallback(ev.callback, consumerHost, ev.subscribe)` 注册订阅

`setValue(v)` 时：
- 更新内部值
- `updateObservers()` — 遍历所有订阅的 callback 并调用

### ContextConsumer

构造时：
- `host.addController(this)` — 注册为 ReactiveController

`hostConnected()` 时：
- `dispatchRequest()` — 从 host 元素派发 `ContextRequestEvent`
- 事件配置：`{ bubbles: true, composed: true }` — 可穿越 Shadow DOM

`_callback(value, unsubscribe)` 时：
- 存储值到 `this.value`
- `this.host.requestUpdate()` — 触发 Lit 重新渲染
- 调用用户提供的 `callback(value, unsubscribe)`

### ContextRoot

- 监听 `context-request` 事件，缓存未被满足的订阅请求（使用 WeakRef 避免内存泄漏）
- 监听 `context-provider` 事件，当新 Provider 出现时重新派发缓存的请求
- 使用 `WeakRef` + `WeakMap` + `WeakSet` 管理缓存，不阻止 GC

## ES 模块求值顺序

### 核心区分：兄弟导入 vs 依赖导入

**兄弟导入**（同一文件中无互相依赖的模块）：**求值顺序按书写位置从上到下**。

```ts
// ffbox-ui-autoregister.ts
import './button.js';           // 兄弟 A，先求值
import './switch.js';           // 兄弟 B，后求值
import './theme-provider.js';  // 兄弟 C，最后求值
```

这就是坑 2 的根因——Provider 作为兄弟排在最后，晚于 Consumer 求值。

**依赖导入**（模块 A import 模块 B）：**B 一定先于 A 求值**，无论 import 写在第几行。

```ts
// ffbox-button.ts
import '../theme-provider/ffbox-theme-provider.js';  // 依赖，先求值
import { LitElement } from 'lit';
// ...
```

ES 模块的 `import` 是**静态声明**，引擎处理过程：

1. **扫描阶段**：收集所有 `import` 声明，构建依赖图
2. **解析阶段**：深度优先后序遍历依赖图，先求值所有依赖
3. **执行阶段**：最后执行当前模块的顶层代码

因此 `ffbox-button.ts` 的求值链：

```
@lit/context                ← 共享依赖，最先求值
ffbox-theme-provider.js     ← ffbox-button 的依赖
  → ContextRoot.attach()    ← 模块级代码执行
  → customElements.define('ffbox-theme-provider', ...)
theme-context.js            ← 共享依赖
ffbox-button.js             ← 最后求值
  → customElements.define('ffbox-button', ...)
```

### 总结

| 场景 | 顺序是否影响 | 原因 |
|------|-------------|------|
| barrel 文件中**兄弟** import 的书写顺序 | ✅ 有影响 | 兄弟模块按出现顺序求值 |
| 单个文件内 import 的**书写位置**（行号） | ❌ 无影响 | 静态声明，依赖先于当前模块求值 |
| 组件 import theme-provider（**依赖关系**） | ❌ 无影响 | 依赖关系保证 Provider 先求值 |
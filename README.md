# FFBox-UI

基于 [Lit](https://lit.dev/) Web Components 的组件库。

## 安装

```bash
npm install ffbox-ui
```

## 快速开始

### 1. 引入组件

**全量引入**（推荐）：

```ts
import 'ffbox-ui';
```

**按需引入**：

```ts
import { FFBoxButton, FFBoxThemeProvider } from 'ffbox-ui';
```

或在非 bundler 环境中：

```html
<script type="importmap">
{
  "imports": {
    "ffbox-ui": "./node_modules/ffbox-ui/dist/esm/ffbox-ui-autoregister.js"
  }
}
</script>
<script type="module">
  import 'ffbox-ui';
</script>
```

### 2. 引入主题样式

```html
<link rel="stylesheet" href="./node_modules/ffbox-ui/dist/themes/light.css">
<link rel="stylesheet" href="./node_modules/ffbox-ui/dist/themes/dark.css">
```

### 3. 使用组件

用 `<ffbox-theme-provider>` 包裹需要主题控制的区域：

```html
<ffbox-theme-provider theme="light">
  <ffbox-button>普通按钮</ffbox-button>
  <ffbox-button type="primary">主要按钮</ffbox-button>
  <ffbox-switch></ffbox-switch>
</ffbox-theme-provider>
```

切换主题只需修改 Provider 的 `theme` 属性：

```js
document.querySelector('ffbox-theme-provider').theme = 'dark';
```

子树中所有组件会自动响应，无需逐个设置。

## 组件列表

### ffbox-theme-provider

主题提供者，向子树注入当前主题值。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` / `data-theme` | `'light' \| 'dark'` | `'light'` | 当前主题 |

### ffbox-button

按钮组件。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'normal' \| 'primary' \| 'danger' \| 'noBg'` | `'normal'` | 按钮类型 |
| `size` | `'small' \| 'normal' \| 'large'` | `'normal'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 是否禁用 |

```html
<ffbox-button>普通按钮</ffbox-button>
<ffbox-button type="primary">主要按钮</ffbox-button>
<ffbox-button type="danger">危险按钮</ffbox-button>
<ffbox-button type="noBg">无背景按钮</ffbox-button>
<ffbox-button size="small">小按钮</ffbox-button>
<ffbox-button size="large">大按钮</ffbox-button>
<ffbox-button disabled>禁用按钮</ffbox-button>
```

### ffbox-switch

开关组件。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `change` | `boolean` | 切换时触发，detail 为新值 |

```html
<ffbox-switch></ffbox-switch>
<ffbox-switch checked></ffbox-switch>
```

### ffbox-checkbox

复选框组件。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean \| 'partial'` | `false` | 选中状态，`'partial'` 为部分选中 |
| `disabled` | `boolean` | `false` | 是否禁用 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `change` | `boolean \| 'partial'` | 状态变化时触发 |

```html
<ffbox-checkbox></ffbox-checkbox>
<ffbox-checkbox checked></ffbox-checkbox>
<ffbox-checkbox checked="partial"></ffbox-checkbox>
```

### ffbox-radio

单选框组件。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean \| 'partial'` | `false` | 选中状态 |
| `disabled` | `boolean` | `false` | 是否禁用 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `change` | `boolean \| 'partial'` | 状态变化时触发 |

```html
<ffbox-radio></ffbox-radio>
<ffbox-radio checked></ffbox-radio>
```

### ffbox-rocker-switch

摇杆开关组件。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'s' \| 'm'` | `'s'` | 尺寸 |
| `disabled-left` | `boolean` | `false` | 禁用左拨 |
| `disabled-right` | `boolean` | `false` | 禁用右拨 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `ffbox-left` | — | 左拨触发 |
| `ffbox-right` | — | 右拨触发 |

```html
<ffbox-rocker-switch>帧率</ffbox-rocker-switch>
<ffbox-rocker-switch size="m">分辨率</ffbox-rocker-switch>
```

### ffbox-auto-size-wrapper

自适应尺寸容器。测量 slot 内容的尺寸，并把结果交给 `customStyle` 回调决定自身样式，常用于「不定高度内容做展开/收起过渡动画」。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `customStyle` | `(size: { width: number; height: number }) => Record<string, string>` | — | 依据测量结果返回样式 |
| `use-resize-observer` | `boolean` | `false` | 是否用 ResizeObserver 自动重测（否则需手动调用 `updateSize()`） |
| `width` / `height` | `number` | `0` | 最近一次测量结果（只读） |

| 事件 | 详情 | 说明 |
|------|------|------|
| `resize` | `{ width, height }` | 每次测量完成时触发 |

| 方法 | 说明 |
|------|------|
| `updateSize()` | 手动触发一次测量 |

```js
const wrapper = document.querySelector('ffbox-auto-size-wrapper');
wrapper.customStyle = ({ height }) => ({
  height: `${height}px`,
  overflow: 'hidden',
  transition: 'height 0.4s',
});
```

> 注意：不可用它去驱动 slot 内部组件自身的高度，那会形成测量回路。子组件高度应当自由撑开。

### ffbox-cut-time-input

裁切时间输入（开始 / 结束两个时间框 + 中间的「编✂️辑」按钮）。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `[string \| undefined, string \| undefined]` | `[undefined, undefined]` | 起止时间 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `placeholder` | `[string, string]` | — | 两个输入框的占位文本 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `change` | `[string \| undefined, string \| undefined]` | 输入、清空时触发 |
| `button-click` | — | 点击「编✂️辑」按钮 |
| `enter` | — | 输入框中按下 Enter |
| `double-click` | — | 双击组件（作为临时的功能） |

```js
const cti = document.querySelector('ffbox-cut-time-input');
cti.value = ['00:00:10.00', '00:00:20.00'];
```

输入内容会经过 `durationFixer` 清理（全角冒号/句号转半角、剔除小写字母），并由 `durationValidator` 校验，非法时背景与边框转红。

### ffbox-msgbox

命令式对话框。通过 `FFBoxMsgbox.show()` 创建，关闭动画结束后组件自行从 DOM 移除。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `''` | 标题 |
| `content` | `string \| TemplateResult \| (() => TemplateResult)` | — | 正文 |
| `image` | `TemplateResult` | — | 顶部图片区域 |
| `buttons` | `MsgboxButton[]` | `[默认按钮]` | 按钮组 |

`MsgboxButton`：`{ text, callback?, type?: ButtonType, role?: 'confirm' | 'cancel' }`
`callback` 返回 `undefined` / `true` 立即关闭，返回 `Promise` 则在 resolve 后关闭，返回 `false` 则保持打开。

| 事件 | 说明 |
|------|------|
| `closed` | 离场动画结束后触发 |

```js
import { FFBoxMsgbox } from 'ffbox-ui';

FFBoxMsgbox.show({
  title: '确认操作',
  content: '确定要删除吗？',
  buttons: [
    { text: '取消', role: 'cancel' },
    { text: '删除', type: 'danger', role: 'confirm', callback: async () => { await doDelete(); } },
  ],
});
```

键盘：单按钮时 Esc / Enter 均触发该按钮；多按钮时 Esc 触发 `role="cancel"`、Enter 触发 `role="confirm"`。

### ffbox-popup

命令式气泡通知。通过 `FFBoxPopup.show()` 创建，自动排队、自动倒计时关闭。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `string` | `''` | 文本，支持 `\n` 换行 |
| `level` | `0 \| 1 \| 2 \| 3` | `0` | 白 \| 绿 \| 黄 \| 红 |

| 事件 | 详情 | 说明 |
|------|------|------|
| `will-close` | `{ isUserInteraction }` | 开始关闭时触发（外部据此重排队列） |
| `closed` | — | 离场动画结束后触发，外部据此销毁 |

```js
import { FFBoxPopup } from 'ffbox-ui';

FFBoxPopup.show({ message: '转码完成', level: 1 });
```

- 停留时长 `2500 + message.length * 100` ms，鼠标悬停时暂停倒计时
- 悬停后进度环变为关闭按钮，点击或鼠标中键点击可立即关闭
- 同屏超过 30 条会淘汰最旧的一条

## 主题系统

### 工作原理

FFBox-UI 使用 `@lit/context` 实现主题传递：

- `ffbox-theme-provider` 通过 `@provide` 装饰器向子树提供主题值
- 各组件通过 `@consume` 装饰器自动订阅主题变化
- 主题值变化时，Consumer 的 `theme` 属性自动更新，并通过 `reflect: true` 反射到 `data-theme` attribute，触发 CSS 选择器 `:host([data-theme="dark"])` 生效

### 切换主题

```js
const provider = document.querySelector('ffbox-theme-provider');
provider.theme = 'dark';  // 所有子组件自动响应
```

### 在 Vue 中使用

```vue
<template>
  <ffbox-theme-provider :theme="isDark ? 'dark' : 'light'">
    <ffbox-button type="primary">按钮</ffbox-button>
  </ffbox-theme-provider>
</template>

<script setup>
import { ref } from 'vue';
// 无需额外导入 theme-provider，组件会自动注册
import 'ffbox-ui';

const isDark = ref(false);
</script>
```

### 在 React 中使用

```tsx
import 'ffbox-ui';

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ffbox-theme-provider theme={isDark ? 'dark' : 'light'}>
      <ffbox-button type="primary">按钮</ffbox-button>
    </ffbox-theme-provider>
  );
}
```

### 自定义主题 CSS

主题 CSS 文件定义了一组 CSS 自定义属性，组件样式引用这些变量。你可以覆盖这些变量来实现自定义主题：

```css
/* 覆盖暗色主题的背景色 */
:host([data-theme="dark"]) {
  --bg99: 0 15% 85%;
  --bg95: 0 10% 90%;
}
```

## 开发

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 构建
npm run build

# 测试
npm run test
```

## 技术细节

关于主题系统的设计决策、踩坑记录和 `@lit/context` 源码分析，参见 [DESIGN.md](./src/components/theme-provider/DESIGN.md)。

## 许可

Partially inherited from FFBox, and the right of interpretation belongs to the original author. The current version must not be used for projects not specified by the author.
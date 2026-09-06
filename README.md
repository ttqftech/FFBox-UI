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
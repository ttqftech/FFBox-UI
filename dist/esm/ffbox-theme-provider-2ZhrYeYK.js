import { j as n, k as t, d as i, f as b, l as e, n as n$1, g as t$1 } from "./lit-Dfi9bTsN.js";
const themeContext = n("ffbox-theme");
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
if (typeof globalThis.__ffbox_context_root_attached === "undefined") {
  globalThis.__ffbox_context_root_attached = true;
  if (typeof document !== "undefined" && document.body) {
    new t().attach(document.body);
  }
}
let FFBoxThemeProvider = class extends i {
  constructor() {
    super(...arguments);
    this.theme = "light";
  }
  // 以下实现等同于装饰器 @provide({ context: themeContext }) 的功能，保留注释以供参考
  // private _provider = new ContextProvider(this, {
  // 	context: themeContext,
  // 	initialValue: this.theme,
  // });
  // willUpdate(changed: Map<string, unknown>) {
  // 	if (changed.has('theme')) {
  // 		this._provider.setValue(this.theme);
  // 	}
  // }
  render() {
    return b`<slot></slot>`;
  }
};
__decorateClass([
  e({ context: themeContext }),
  n$1({ reflect: true, attribute: "data-theme" })
], FFBoxThemeProvider.prototype, "theme", 2);
FFBoxThemeProvider = __decorateClass([
  t$1("ffbox-theme-provider")
], FFBoxThemeProvider);
export {
  FFBoxThemeProvider as F,
  themeContext as t
};
//# sourceMappingURL=ffbox-theme-provider-2ZhrYeYK.js.map

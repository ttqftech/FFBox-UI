import { a as i, n, d as i$1, f as b, g as t } from "../../lit-Dfi9bTsN.js";
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
let FFBoxTooltip = class extends i$1 {
  constructor() {
    super(...arguments);
    this.content = "";
    this.show = false;
    this.className = "";
    this.theme = "light";
  }
  render() {
    const lines = this.content.split("\n");
    const boxClasses = ["tooltip-box", this.show ? "" : "hidden", this.className].filter(Boolean);
    return b`
			<div class=${boxClasses.join(" ")}>
				<div class="tooltip-message">
					${lines.map((line, i2) => b`${line}${i2 < lines.length - 1 ? b`<br/>` : ""}`)}
				</div>
			</div>
		`;
  }
};
FFBoxTooltip.styles = i`
		:host {
			display: block;
			position: fixed;
			z-index: 100;
			pointer-events: none;
			max-width: calc(200px + 25%);
		}

		.tooltip-box {
			padding: 10px 12px;
			background: hwb(var(--bg98));
			border: hsl(0, 0%, 67%) 1px solid;
			border-radius: 10px;
			box-shadow: 0px 4px 8px hsla(0, 0%, 0%, 0.3);
			z-index: 5;
			opacity: 1;
			transition: opacity 0.1s linear;
		}

		.tooltip-box.hidden {
			opacity: 0;
			transition: opacity 0.2s linear;
		}

		.tooltip-box.small {
			position: relative;
			top: -1px;
			padding: 6px 10px;
			border-radius: 8px;
			border: none;
			background-color: hwb(var(--hoverLightBg) / 0.5);
			backdrop-filter: blur(8px) contrast(110%);
			box-shadow: 0 0 1px 0.5px hwb(var(--hoverLightBg)),
						0 1.5px 4px 0 hwb(var(--hoverShadow) / 0.2),
						0 1px 0.5px 0px hwb(var(--highlight) / 0.5) inset;
		}

		.tooltip-box.small .tooltip-message {
			font-size: 12px;
			line-height: 16px;
		}

		.tooltip-message {
			font-size: 14px;
			line-height: 1.3em;
			text-align: left;
		}
	`;
__decorateClass([
  n({ reflect: true })
], FFBoxTooltip.prototype, "content", 2);
__decorateClass([
  n({ type: Boolean, reflect: true })
], FFBoxTooltip.prototype, "show", 2);
__decorateClass([
  n({ reflect: true })
], FFBoxTooltip.prototype, "className", 2);
__decorateClass([
  n({ reflect: true, attribute: "data-theme" })
], FFBoxTooltip.prototype, "theme", 2);
FFBoxTooltip = __decorateClass([
  t("ffbox-tooltip")
], FFBoxTooltip);
let _instance = null;
function _getInstance() {
  if (!_instance) {
    _instance = document.createElement("ffbox-tooltip");
    document.body.appendChild(_instance);
  }
  return _instance;
}
function _detectTheme() {
  const provider = document.querySelector("ffbox-theme-provider");
  if (provider) return provider.theme;
  return "light";
}
FFBoxTooltip.show = function(options) {
  const el = _getInstance();
  el.theme = _detectTheme();
  el.content = options.content;
  el.className = options.className ?? "";
  el.show = true;
  el.style.top = "";
  el.style.bottom = "";
  el.style.left = "";
  el.style.right = "";
  el.style.transform = "";
  if (options.style) {
    Object.assign(el.style, options.style);
  }
};
FFBoxTooltip.hide = function() {
  if (_instance) {
    _instance.show = false;
  }
};
export {
  FFBoxTooltip
};
//# sourceMappingURL=ffbox-tooltip.js.map

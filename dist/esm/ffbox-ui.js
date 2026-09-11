import { F, t } from "./ffbox-theme-provider-DLHSaw2W.js";
import { FFBoxButton } from "./components/button/ffbox-button.js";
import { FFBoxSwitch } from "./components/switch/ffbox-switch.js";
import { FFBoxCheckbox } from "./components/checkbox/ffbox-checkbox.js";
import { FFBoxRadio } from "./components/radio/ffbox-radio.js";
import { FFBoxRockerSwitch } from "./components/rocker-switch/ffbox-rocker-switch.js";
import { FFBoxSlider } from "./components/slider/ffbox-slider.js";
import { FFBoxNormalInput } from "./components/normal-input/ffbox-normal-input.js";
import { FFBoxInputAutoSize } from "./components/input-auto-size/ffbox-input-auto-size.js";
import { FFBoxControlBox } from "./components/control-box/ffbox-control-box.js";
import { FFBoxRadioList } from "./components/radio-list/ffbox-radio-list.js";
import { FFBoxAutoSizeWrapper } from "./components/auto-size-wrapper/ffbox-auto-size-wrapper.js";
import { F as F2, d, a, n, b } from "./ffbox-cut-time-input-C3gwJWwW.js";
import { FFBoxMsgbox } from "./components/msgbox/ffbox-msgbox.js";
import { FFBoxPopup } from "./components/popup/ffbox-popup.js";
import { FFBoxTooltip } from "./components/tooltip/ffbox-tooltip.js";
import { d as e, f as i, g as t2, E } from "./lit-CCLFh2ru.js";
import { FFBoxMenu } from "./components/menu/ffbox-menu.js";
import { FFBoxDropdownInput } from "./components/dropdown-input/ffbox-dropdown-input.js";
function _computeStyle(position, e2) {
  const rect = e2.target.getBoundingClientRect();
  switch (position) {
    case "mtl":
      return { top: `${e2.clientY}px`, right: `${window.innerWidth - e2.clientX}px` };
    case "t":
      return { bottom: `${window.innerHeight - rect.top}px`, left: `${rect.left + rect.width / 2}px`, transform: "translateX(-50%)" };
    case "tl":
      return { bottom: `${window.innerHeight - rect.top}px`, left: `${rect.left}px` };
    case "tr":
      return { bottom: `${window.innerHeight - rect.top}px`, right: `${window.innerWidth - rect.right}px` };
    case "r":
      return { top: `${rect.top + rect.height / 2}px`, left: `${rect.left + rect.width}px`, transform: "translateY(-50%)" };
    case "br":
    default:
      return { top: `${rect.top + rect.height}px`, right: `${window.innerWidth - rect.right}px` };
  }
}
class TooltipDirective extends i {
  constructor(partInfo) {
    super(partInfo);
    this._onMouseenter = null;
    this._onMouseleave = null;
    if (partInfo.type !== t2.ELEMENT) {
      throw new Error("tooltip 指令只能用于元素");
    }
  }
  update(part, [content, position, styleName]) {
    const el = part.element;
    if (this._onMouseenter) {
      el.removeEventListener("mouseenter", this._onMouseenter);
      el.removeEventListener("mouseleave", this._onMouseleave);
    }
    this._onMouseenter = (e2) => {
      FFBoxTooltip.show({
        content,
        style: _computeStyle(position, e2),
        className: styleName === "small" ? "small" : void 0
      });
    };
    this._onMouseleave = () => {
      FFBoxTooltip.hide();
    };
    el.addEventListener("mouseenter", this._onMouseenter);
    el.addEventListener("mouseleave", this._onMouseleave);
    return E;
  }
  render(_content, _position, _styleName) {
    return E;
  }
}
const tooltip = e(TooltipDirective);
function useTooltip(content, position = "br", styleName = "small") {
  return {
    onmouseenter: (e2) => {
      FFBoxTooltip.show({
        content,
        style: _computeStyle(position, e2),
        className: styleName === "small" ? "small" : void 0
      });
    },
    onmouseleave: () => {
      FFBoxTooltip.hide();
    }
  };
}
function getMenuItemByValue(menu, value, compareFunc) {
  function dfs(menu2) {
    for (const menuItem of menu2) {
      if (menuItem.type === "submenu") {
        const result = dfs(menuItem.subMenu);
        if (result) {
          return result;
        }
      } else if ("value" in menuItem && (compareFunc ? compareFunc(menuItem.value, value) : menuItem.value === value)) {
        return menuItem;
      }
    }
  }
  return dfs(menu);
}
export {
  FFBoxAutoSizeWrapper,
  FFBoxButton,
  FFBoxCheckbox,
  FFBoxControlBox,
  F2 as FFBoxCutTimeInput,
  FFBoxDropdownInput,
  FFBoxInputAutoSize,
  FFBoxMenu,
  FFBoxMsgbox,
  FFBoxNormalInput,
  FFBoxPopup,
  FFBoxRadio,
  FFBoxRadioList,
  FFBoxRockerSwitch,
  FFBoxSlider,
  FFBoxSwitch,
  F as FFBoxThemeProvider,
  FFBoxTooltip,
  d as durationFixer,
  a as durationValidator,
  getMenuItemByValue,
  n as notEmptyValidator,
  b as numberValidator,
  t as themeContext,
  tooltip,
  useTooltip
};
//# sourceMappingURL=ffbox-ui.js.map

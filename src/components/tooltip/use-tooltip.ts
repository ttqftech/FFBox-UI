import { Directive, directive, PartInfo, PartType, ElementPart } from 'lit/directive.js';
import { noChange } from 'lit';
import { FFBoxTooltip } from './ffbox-tooltip.js';

export type TooltipPosition = 'br' | 'r' | 't' | 'tl' | 'tr' | 'mtl';
export type TooltipStyleName = 'small' | 'large';

function _computeStyle(position: TooltipPosition, e: MouseEvent): Partial<CSSStyleDeclaration> {
	const rect = (e.target as HTMLElement).getBoundingClientRect();

	switch (position) {
		case 'mtl':
			return { top: `${e.clientY}px`, right: `${window.innerWidth - e.clientX}px` };
		case 't':
			return { bottom: `${window.innerHeight - rect.top}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)' };
		case 'tl':
			return { bottom: `${window.innerHeight - rect.top}px`, left: `${rect.left}px` };
		case 'tr':
			return { bottom: `${window.innerHeight - rect.top}px`, right: `${window.innerWidth - rect.right}px` };
		case 'r':
			return { top: `${rect.top + rect.height / 2}px`, left: `${rect.left + rect.width}px`, transform: 'translateY(-50%)' };
		case 'br':
		default:
			return { top: `${rect.top + rect.height}px`, right: `${window.innerWidth - rect.right}px` };
	}
}

class TooltipDirective extends Directive {
	private _onMouseenter: ((e: Event) => void) | null = null;
	private _onMouseleave: (() => void) | null = null;

	constructor(partInfo: PartInfo) {
		super(partInfo);
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('tooltip 指令只能用于元素');
		}
	}

	update(part: ElementPart, [content, position, styleName]: [string, TooltipPosition, TooltipStyleName]) {
		const el = part.element;

		if (this._onMouseenter) {
			el.removeEventListener('mouseenter', this._onMouseenter);
			el.removeEventListener('mouseleave', this._onMouseleave!);
		}

		this._onMouseenter = (e: Event) => {
			FFBoxTooltip.show({
				content,
				style: _computeStyle(position, e as MouseEvent),
				className: styleName === 'small' ? 'small' : undefined,
			});
		};
		this._onMouseleave = () => { FFBoxTooltip.hide(); };

		el.addEventListener('mouseenter', this._onMouseenter);
		el.addEventListener('mouseleave', this._onMouseleave);

		return noChange;
	}

	render(_content: string, _position: TooltipPosition, _styleName: TooltipStyleName) {
		return noChange;
	}
}

/** 功能未验证 */
export const tooltip = directive(TooltipDirective);

export function useTooltip(
	content: string,
	position: TooltipPosition = 'br',
	styleName: TooltipStyleName = 'small',
) {
	return {
		onmouseenter: (e: MouseEvent) => {
			FFBoxTooltip.show({
				content,
				style: _computeStyle(position, e),
				className: styleName === 'small' ? 'small' : undefined,
			});
		},
		onmouseleave: () => { FFBoxTooltip.hide(); },
	};
}

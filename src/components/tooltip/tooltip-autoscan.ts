import { useTooltip } from './use-tooltip.js';
import { type TooltipPosition, type TooltipStyleName } from './tooltip-helpers.js';

const _DEFAULT_ATTR = 'data-tooltip';
const _observedElements = new WeakSet<HTMLElement>();
let _observer: MutationObserver | null = null;
let _attrName: string = _DEFAULT_ATTR;

function _parseAttr(value: string): [string, TooltipPosition, TooltipStyleName] {
	const parts = value.split(';');
	const content = parts[0];
	const position = (parts[1]?.trim() || 'br') as TooltipPosition;
	const styleName = (parts[2]?.trim() || 'small') as TooltipStyleName;
	return [content, position, styleName];
}

function _bindTooltipFromAttr(el: HTMLElement) {
	if (_observedElements.has(el)) return;
	const raw = el.getAttribute(_attrName);
	if (raw === null) return;
	_observedElements.add(el);
	const [content, position, styleName] = _parseAttr(raw);
	const { onmouseenter, onmouseleave } = useTooltip(content, position, styleName);
	el.addEventListener('mouseenter', onmouseenter);
	el.addEventListener('mouseleave', onmouseleave);
}

function _bindDescendants(root: ParentNode) {
	root.querySelectorAll<HTMLElement>(`[${_attrName}]`).forEach(_bindTooltipFromAttr);
}

export function enableTooltipAutoscan(attrName: string = _DEFAULT_ATTR) {
	if (_observer) return;
	_attrName = attrName;
	_observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			for (const node of m.addedNodes) {
				if (node instanceof HTMLElement) {
					_bindTooltipFromAttr(node);
					_bindDescendants(node);
				}
			}
		}
	});
	const start = () => {
		_bindDescendants(document);
		_observer!.observe(document.body, { childList: true, subtree: true });
	};
	if (document.body) start();
	else document.addEventListener('DOMContentLoaded', start, { once: true });
}

export function disableTooltipAutoscan() {
	if (!_observer) return;
	_observer.disconnect();
	_observer = null;
}

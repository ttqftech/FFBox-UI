export type TooltipPosition = 'br' | 'r' | 't' | 'tl' | 'tr' | 'mtl';
export type TooltipStyleName = 'small' | 'large';

export function computeTooltipStyle(position: TooltipPosition, e: MouseEvent): Partial<CSSStyleDeclaration> {
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

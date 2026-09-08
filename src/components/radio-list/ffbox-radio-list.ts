import '../theme-provider/ffbox-theme-provider.js';
import '../input-auto-size/ffbox-input-auto-size.js';
import { LitElement, html, css, nothing } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';
import closeIcon from './close.svg?raw';

export interface RadioListItem {
	value: string;
	caption?: string;
	deletable?: boolean;
	editable?: boolean;
	disabled?: boolean;
}

@customElement('ffbox-radio-list')
export class FFBoxRadioList extends LitElement {
	static styles = css`
		:host {
			display: block;
		}

		.radioList {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			justify-content: center;
			align-content: center;
			box-sizing: border-box;
			height: 100%;
			min-height: 120px;
			padding: 16px;
			gap: 6px;
			isolation: isolate;
		}

		.item {
			height: 30px;
			box-sizing: border-box;
			padding: 0 23px 0 20px;
			position: relative;
			outline: none;
			border: none;
			font-size: 13px;
			line-height: 30px;
			white-space: nowrap;
			color: inherit;
			background-color: hwb(var(--bg99) / 0.8);
			border-radius: 4px;
			box-shadow: 0 0 1px 0.5px hwb(var(--highlight)),
						0 1.5px 3px 0 hwb(var(--hoverShadow) / 0.2);
			border-left: transparent 3px solid;
			transition: all 0.3s cubic-bezier(0, 1.5, 0.3, 1);
		}

		.item:not(.itemSelected):hover::after {
			content: '';
			position: absolute;
			top: 0;
			left: -3px;
			width: calc(100% + 3px);
			height: 100%;
			border-radius: inherit;
			box-shadow: 0 0 2px hwb(var(--hoverShadow) / 0.2);
			z-index: 1;
		}

		.itemSelected {
			background-color: hwb(var(--bg97) / 0.8);
			border-radius: 3px 4px 4px 3px;
			box-shadow: 0 0 2px 1px hwb(var(--hoverShadow) / 0.05),
						0 3px 6px hwb(var(--hoverShadow) / 0.1) inset;
			border-left: #49e 3px solid;
		}

		.itemDisabled {
			color: #77777777;
			pointer-events: none;
		}

		.itemLabel {
			user-select: none;
			-webkit-user-select: none;
		}

		.itemLabelEmpty {
			opacity: 0.5;
		}

		.itemDelete {
			position: absolute;
			top: 0;
			right: 0;
			height: 100%;
			width: 20px;
			border: none;
			border-radius: 0 4px 4px 0;
			outline: none;
			background: none;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			opacity: 0.5;
			z-index: 2;
			user-select: none;
		}

		.itemDelete:hover {
			box-shadow: 0 0 3px hwb(var(--hoverShadow) / 0.1);
			background: hwb(var(--hoverLightBg) / 0.5);
			opacity: 1;
		}

		.itemDelete:active {
			box-shadow: 0 0 2px 1px hwb(var(--hoverShadow) / 0.05),
						0 6px 12px hwb(var(--hoverShadow) / 0.15) inset;
			transform: translateY(0.5px);
		}

		.itemDelete svg {
			width: 16px;
		}

		.editingInput {
			margin: 0 -4px;
		}
	`;

	@property({ attribute: false }) list: RadioListItem[] = [];
	@property({ reflect: true }) value = '';
	@property() placeholder = '';
	@consume({ context: themeContext, subscribe: true })
	@property({ reflect: true, attribute: 'data-theme' }) theme: Theme = 'light';

	@state() private _editingIndex: number = -1;

	render() {
		return html`
			<div class="radioList">
				${this.list.map((item, index) => this._renderItem(item, index))}
			</div>
		`;
	}

	private _renderItem(item: RadioListItem, index: number) {
		const isSelected = item.value === this.value;
		const isDisabled = item.disabled;
		const isEditing = this._editingIndex === index;

		const classes = ['item'];
		if (isSelected) classes.push('itemSelected');
		if (isDisabled) classes.push('itemDisabled');

		const label = item.caption || (item.value === '' ? this.placeholder : item.value);
		const isEmpty = item.value === '';

		return html`
			<button
				class=${classes.join(' ')}
				@mousedown=${(e: MouseEvent) => this._handleItemClick(e, item, index)}
			>
				${isEditing
					? html`<ffbox-input-auto-size
						class="editingInput"
						focus-on-mounted
						.value=${item.value}
						@blur=${(e: CustomEvent) => this._handleEditConfirm(item, e.detail, index)}
						@press-enter=${(e: CustomEvent) => this._editingIndex = -1}
						@change=${(e: Event) => e.stopPropagation() /* 拦截下层 change 事件穿透上去 */}
					></ffbox-input-auto-size>`
					: html`<span
						class=${['itemLabel', isEmpty ? 'itemLabelEmpty' : ''].filter(Boolean).join(' ')}
						@click=${(e: MouseEvent) => this._handleLabelClick(e, item, index)}
					>${label}</span>`
				}
				${item.deletable && !isEditing
					? html`<button
						class="itemDelete"
						aria-label="删除此项"
						@click=${(e: MouseEvent) => this._handleDelete(e, item, index)}
					>${unsafeSVG(closeIcon)}</button>`
					: nothing
				}
			</button>
		`;
	}

	private _handleItemClick(_e: MouseEvent, item: RadioListItem, index: number) {
		if (this._editingIndex !== -1) return;
		if (item.value !== this.value) {
			this.value = item.value;
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: item.value, index },
				bubbles: true,
				composed: true,
			}));
		}
	}

	private _handleLabelClick(e: MouseEvent, item: RadioListItem, index: number) {
		if (item.editable && item.caption == null) {
			e.stopPropagation();
			this._editingIndex = index;
		}
	}

	private _handleEditConfirm(item: RadioListItem, newValue: string, index: number) {
		this._editingIndex = -1;
		this.dispatchEvent(new CustomEvent('edit', {
			detail: { oldValue: item.value, newValue, index },
			bubbles: true,
			composed: true,
		}));
	}

	private _handleDelete(e: MouseEvent, item: RadioListItem, index: number) {
		e.stopImmediatePropagation();
		this.dispatchEvent(new CustomEvent('delete', {
			detail: { value: item.value, index },
			bubbles: true,
			composed: true,
		}));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-radio-list': FFBoxRadioList;
	}
}
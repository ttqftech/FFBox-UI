import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { provide, ContextRoot } from '@lit/context';
import { themeContext, Theme } from '../../contexts/theme-context.js';

declare global {
	var __ffbox_context_root_attached: boolean | undefined;
}

if (typeof globalThis.__ffbox_context_root_attached === 'undefined') {
	globalThis.__ffbox_context_root_attached = true;
	if (typeof document !== 'undefined' && document.body) {
		new ContextRoot().attach(document.body);
	}
}

@customElement('ffbox-theme-provider')
export class FFBoxThemeProvider extends LitElement {
	@provide({ context: themeContext })
	@property({ reflect: true, attribute: 'data-theme' })
	theme: Theme = 'light';

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
		return html`<slot></slot>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'ffbox-theme-provider': FFBoxThemeProvider;
	}
}

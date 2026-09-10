import type { Page } from '@playwright/test';

/**
 * 打开 playground 并等待自定义元素注册完成。
 *
 * Vite dev server 是按需编译的：HTML 到达浏览器时组件模块可能还没求值，
 * 此时页面上的 DOM 虽已存在，但点击不会触发任何组件行为（自定义元素尚未升级），
 * 断言就会偶发「element(s) not found」——高并发跑测试时尤其明显。
 * 这里统一等一个组件注册成功再交给测试，避免每个断言各自重试。
 */
export async function openPlayground(page: Page) {
  await page.goto('/playground/');
  await page.waitForFunction(() => !!customElements.get('ffbox-button'), undefined, { timeout: 20_000 });
}

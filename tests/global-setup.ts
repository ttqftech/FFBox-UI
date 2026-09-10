import { chromium } from '@playwright/test';

/**
 * 预热：先单独开一个浏览器把 playground 完整加载一次。
 *
 * Vite dev server 首次收到请求时要做依赖预构建 + 按需编译，
 * 如果所有 worker 同时冷启动，先到的会被拖慢到断言超时（表现为随机的 element(s) not found）。
 * 这里提前把模块编译结果喂给 dev server 缓存，后面的 worker 就都是热加载了。
 */
export default async function globalSetup() {
  console.log('开始预热 Vite dev server');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ baseURL: 'http://localhost:6006' });
    await page.goto('/playground/');
    await page.waitForFunction(() => !!customElements.get('ffbox-button'), undefined, { timeout: 30_000 });
  } finally {
    await browser.close();
    console.log('预热 Vite dev server 完成，开始测试');
  }
}

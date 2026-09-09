import { test, expect } from '@playwright/test';

test('ffbox-auto-size-wrapper 测量 slot 尺寸', async ({ page }) => {
  await page.goto('/playground/');

  const asw = page.locator('#asw1');
  await expect(asw).toBeVisible();

  // 挂载后完成首次测量并派发 resize 事件
  const log = page.locator('#asw1-log');
  await expect(log).toContainText('AutoSizeWrapper 1 →');
  const sizeSpan = page.locator('#asw-size');
  await expect(sizeSpan).not.toHaveText('0 × 0');

  // 宽度与容器一致（320px），高度大于 0
  const [width, height] = (await sizeSpan.textContent() ?? '').split('×').map(s => Number(s.trim()));
  expect(width).toBeGreaterThan(300);
  expect(height).toBeGreaterThan(0);
});

test('ffbox-auto-size-wrapper customStyle 驱动容器高度', async ({ page }) => {
  await page.goto('/playground/');

  const wrapper = page.locator('#asw1 .autoSizeWrapper');
  await expect(wrapper).toBeVisible();

  const heightBefore = await wrapper.evaluate(el => el.getBoundingClientRect().height);

  // 展开内容 → 手动 updateSize → 容器高度变大（带过渡）
  await page.locator('#aswToggle').click();
  await page.waitForTimeout(700);
  const heightAfter = await wrapper.evaluate(el => el.getBoundingClientRect().height);
  expect(heightAfter).toBeGreaterThan(heightBefore);

  // 收起 → 高度回落
  await page.locator('#aswToggle').click();
  await page.waitForTimeout(700);
  const heightCollapsed = await wrapper.evaluate(el => el.getBoundingClientRect().height);
  expect(heightCollapsed).toBeLessThan(heightAfter);
});

test('ffbox-auto-size-wrapper use-resize-observer 自动重测', async ({ page }) => {
  await page.goto('/playground/');

  const asw2 = page.locator('#asw2');
  const wrapper = asw2.locator('.autoSizeWrapper');
  const sizeSpan = page.locator('#asw2-size');

  await expect(sizeSpan).not.toHaveText('0 × 0');
  const heightBefore = await wrapper.evaluate(el => el.getBoundingClientRect().height);

  // 未开启 ResizeObserver 时不会自动重测，开启后内容变化应自动反映
  await page.locator('#aswToggle').click();
  await expect.poll(async () => {
    return await wrapper.evaluate(el => el.getBoundingClientRect().height);
  }, { timeout: 3000 }).toBeGreaterThan(heightBefore);

  // 日志中记录了 asw2 的重新测量
  await expect(page.locator('#asw2-log')).toContainText('AutoSizeWrapper 2 →');
});

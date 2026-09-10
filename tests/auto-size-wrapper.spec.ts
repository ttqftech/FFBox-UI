import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-auto-size-wrapper', () => {
  test('测量 slot 尺寸', async ({ page }) => {
    await openPlayground(page);

    await test.step('挂载后可见', async () => {
      await softExpect(page.locator('#asw1')).toBeVisible();
    });

    await test.step('完成首次测量并派发 resize 事件', async () => {
      await softExpect(page.locator('#asw1-log')).toContainText('AutoSizeWrapper 1 →');
      await softExpect(page.locator('#asw-size')).not.toHaveText('0 × 0');
    });

    await test.step('宽度与容器一致（320px），高度大于 0', async () => {
      const sizeText = (await page.locator('#asw-size').textContent()) ?? '';
      const [width, height] = sizeText.split('×').map(s => Number(s.trim()));
      softExpect(width).toBeGreaterThan(300);
      softExpect(height).toBeGreaterThan(0);
    });
  });

  test('customStyle 驱动容器高度', async ({ page }) => {
    await openPlayground(page);
    const wrapper = page.locator('#asw1 .autoSizeWrapper');

    await test.step('容器可见并记录初始高度', async () => {
      await softExpect(wrapper).toBeVisible();
    });
    const heightBefore = await wrapper.evaluate(el => el.getBoundingClientRect().height);

    // test.step 的返回值会被透传出来，方便后续步骤复用
    const heightAfter = await test.step('展开内容后容器高度变大（带过渡）', async () => {
      await page.locator('#aswToggle').click();
      await page.waitForTimeout(700);
      const height = await wrapper.evaluate(el => el.getBoundingClientRect().height);
      softExpect(height).toBeGreaterThan(heightBefore);
      return height;
    });

    await test.step('收起后高度回落', async () => {
      await page.locator('#aswToggle').click();
      await page.waitForTimeout(700);
      const heightCollapsed = await wrapper.evaluate(el => el.getBoundingClientRect().height);
      softExpect(heightCollapsed).toBeLessThan(heightAfter);
    });
  });

  test('use-resize-observer 自动重测', async ({ page }) => {
    await openPlayground(page);
    const wrapper = page.locator('#asw2 .autoSizeWrapper');
    const sizeSpan = page.locator('#asw2-size');

    await test.step('初始测量完成', async () => {
      await softExpect(sizeSpan).not.toHaveText('0 × 0');
    });
    const heightBefore = await wrapper.evaluate(el => el.getBoundingClientRect().height);

    // 开启 ResizeObserver 后内容变化应自动反映
    await test.step('内容变化后自动重测（高度变大）', async () => {
      await page.locator('#aswToggle').click();
      await expect.poll(async () => {
        return await wrapper.evaluate(el => el.getBoundingClientRect().height);
      }, { timeout: 3000 }).toBeGreaterThan(heightBefore);
    });

    await test.step('日志记录 asw2 的重新测量', async () => {
      await softExpect(page.locator('#asw2-log')).toContainText('AutoSizeWrapper 2 →');
    });
  });
});

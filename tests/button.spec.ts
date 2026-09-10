import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-button', () => {
  test('基础渲染与交互', async ({ page }) => {
    await openPlayground(page);

    await test.step('默认渲染：按钮可见且带默认文案', async () => {
      const button = page.locator('ffbox-button').first();
      await softExpect(button).toBeVisible();
      const text = await button.evaluate((el: HTMLElement) => el.textContent?.trim());
      softExpect(text).toBe('普通按钮');
    });

    // 限定在 Button 区块内，其他组件内部也用到了 ffbox-button
    await test.step('渲染出全部 10 个按钮', async () => {
      await softExpect(page.locator('#button-section ffbox-button')).toHaveCount(10);
    });

    await test.step('禁用按钮点击后不触发 click 事件', async () => {
      await page.locator('ffbox-button[disabled]').first().click();
      await softExpect(page.locator('#button-log')).toHaveText('');
    });

    await test.step('普通按钮点击后触发 click 事件', async () => {
      await page.locator('ffbox-button').first().click();
      await softExpect(page.locator('#button-log')).toContainText('Button clicked');
    });

    await test.step('type 变体渲染出对应类（primary / danger / noBg）', async () => {
      const byType = (type: string) => page.locator(`#button-section ffbox-button[type="${type}"]`).first().locator('button');
      await softExpect(byType('primary')).toHaveClass(/primary/);
      await softExpect(byType('danger')).toHaveClass(/danger/);
      await softExpect(byType('noBg')).toHaveClass(/noBg/);
    });

    await test.step('size 变体渲染出对应类（small / large）', async () => {
      const bySize = (size: string) => page.locator(`#button-section ffbox-button[size="${size}"]`).first().locator('button');
      await softExpect(bySize('small')).toHaveClass(/small/);
      await softExpect(bySize('large')).toHaveClass(/large/);
    });
  });
});

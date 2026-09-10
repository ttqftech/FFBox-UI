import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-tooltip', () => {
  test('Tooltip.show 调用', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipShowBtn').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('通过 Tooltip.show 调用');
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });

  test('useTooltip 包裹', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipUseBtn').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('useTooltip 包裹');
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });
});

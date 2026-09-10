import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-switch', () => {
  test('渲染与切换', async ({ page }) => {
    await openPlayground(page);
    const switchA = page.locator('#switchA');
    const valueSpan = page.locator('#switchA-value');
    const slipper = switchA.locator('.switch-slipper');

    await test.step('渲染出开关', async () => {
      await softExpect(page.locator('ffbox-switch').first()).toBeVisible();
    });

    await test.step('初始状态与 checked 属性一致', async () => {
      await softExpect(switchA).not.toHaveAttribute('checked', '');
      await softExpect(page.locator('#switchB')).toHaveAttribute('checked', '');
    });

    await test.step('未选中时值为 false、滑块在左侧', async () => {
      await softExpect(valueSpan).toHaveText('false');
      await softExpect(slipper).toHaveCSS('left', '0px');
    });

    await test.step('点击后值为 true、滑块右移', async () => {
      await switchA.click();
      await softExpect(valueSpan).toHaveText('true');
      await softExpect(slipper).toHaveCSS('left', '64px');
      await softExpect(page.locator('#switch-log')).toContainText('Switch A → true');
    });

    await test.step('再次点击回到 false', async () => {
      await switchA.click();
      await softExpect(valueSpan).toHaveText('false');
    });
  });

  test('键盘操作与无障碍属性', async ({ page }) => {
    await openPlayground(page);
    const slipperA = page.locator('#switchA .switch-slipper');
    const slipperB = page.locator('#switchB .switch-slipper');
    const valueSpan = page.locator('#switchA-value');
    const log = page.locator('#switch-log');

    await test.step('滑块暴露 role=switch 与 aria-checked', async () => {
      await softExpect(slipperA).toHaveAttribute('role', 'switch');
      await softExpect(slipperA).toHaveAttribute('aria-checked', 'false');
      await softExpect(slipperB).toHaveAttribute('aria-checked', 'true');
    });

    await test.step('方向键右 → 选中，左 → 取消', async () => {
      await slipperA.focus();
      await slipperA.press('ArrowRight');
      await softExpect(valueSpan).toHaveText('true');
      await softExpect(log).toContainText('Switch A → true');

      await slipperA.press('ArrowLeft');
      await softExpect(valueSpan).toHaveText('false');
      await softExpect(log).toContainText('Switch A → false');
    });

    await test.step('空格切换选中状态', async () => {
      await slipperA.focus();
      await slipperA.press('Space');
      await softExpect(valueSpan).toHaveText('true');
      await slipperA.press('Space');
      await softExpect(valueSpan).toHaveText('false');
    });

    await test.step('Enter 切换选中状态', async () => {
      await slipperA.focus();
      await slipperA.press('Enter');
      await softExpect(valueSpan).toHaveText('true');
    });
  });
});

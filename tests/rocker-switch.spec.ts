import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-rocker-switch', () => {
  test('渲染与左右按钮', async ({ page }) => {
    await openPlayground(page);
    const rs1 = page.locator('#rs1');
    const log = page.locator('#rocker-log');

    await test.step('渲染出船型开关', async () => {
      await softExpect(page.locator('ffbox-rocker-switch').first()).toBeVisible();
    });

    await test.step('渲染标签文案', async () => {
      await softExpect(rs1).toContainText('小船型按钮');
    });

    await test.step('size 变体渲染（s 默认 / m 中号）', async () => {
      await softExpect(page.locator('#rs1')).toHaveAttribute('size', 's');
      await softExpect(page.locator('#rs2')).toHaveAttribute('size', 'm');
      await softExpect(page.locator('#rs2')).toContainText('中船型按钮');
    });

    await test.step('点击左箭头触发 left', async () => {
      await rs1.locator('.arrowLeft').click();
      await softExpect(log).toContainText('Rocker ← left');
    });

    await test.step('点击右箭头触发 right', async () => {
      await rs1.locator('.arrowRight').click();
      await softExpect(log).toContainText('Rocker → right');
    });

    await test.step('disabled-left 时左按钮禁用', async () => {
      const leftBtn = page.locator('ffbox-rocker-switch[disabled-left]').first().locator('.arrowLeft');
      await softExpect(leftBtn).toBeDisabled();
    });

    await test.step('disabled-right 时右按钮禁用', async () => {
      const rightBtn = page.locator('ffbox-rocker-switch[disabled-right]').first().locator('.arrowRight');
      await softExpect(rightBtn).toBeDisabled();
    });
  });
});

import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-checkbox', () => {
  test('渲染与勾选', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#checkbox-log');

    await test.step('渲染出复选框', async () => {
      await softExpect(page.locator('ffbox-checkbox').first()).toBeVisible();
    });

    await test.step('点击未选中的复选框 → true', async () => {
      await page.locator('#cb1').click();
      await softExpect(log).toContainText('Checkbox → true');
    });

    await test.step('点击已选中的复选框 → false', async () => {
      await page.locator('#cb2').click();
      await softExpect(log).toContainText('Checkbox → false');
    });

    await test.step('partial 半选态渲染选中样式并反射为 partial', async () => {
      const cb3 = page.locator('#cb3');
      await softExpect(cb3).toHaveAttribute('checked', 'partial');
      await softExpect(cb3.locator('.box')).toHaveClass(/boxSelected/);
    });

    await test.step('禁用的复选框点击后状态不变', async () => {
      const disabledCb = page.locator('ffbox-checkbox[disabled]').first();
      await disabledCb.click();
      await softExpect(disabledCb).not.toHaveAttribute('checked', '');
    });
  });
});

test.describe('ffbox-radio', () => {
  test('渲染与选中', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#radio-log');

    await test.step('渲染出单选框', async () => {
      await softExpect(page.locator('ffbox-radio').first()).toBeVisible();
    });

    await test.step('点击未选中的单选框 → true', async () => {
      await page.locator('#r1').click();
      await softExpect(log).toContainText('Radio → true');
    });

    await test.step('点击已选中的单选框 → false', async () => {
      await page.locator('#r2').click();
      await softExpect(log).toContainText('Radio → false');
    });

    await test.step('禁用的单选框点击后状态不变', async () => {
      const disabledRadio = page.locator('ffbox-radio[disabled]').first();
      await disabledRadio.click();
      await softExpect(disabledRadio).not.toHaveAttribute('checked', '');
    });
  });
});

import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-cut-time-input', () => {
  test('渲染与初值', async ({ page }) => {
    await openPlayground(page);

    await test.step('渲染两个时间输入框并带初值', async () => {
      const cti = page.locator('#cti1');
      await softExpect(cti).toBeVisible();
      const inputs = cti.locator('input');
      await softExpect(inputs).toHaveCount(2);
      await softExpect(inputs.nth(0)).toHaveValue('00:00:10.00');
      await softExpect(inputs.nth(1)).toHaveValue('00:00:20.00');
    });

    await test.step('placeholder 属性生效（cti1 配置了开始/结束占位）', async () => {
      await softExpect(page.locator('#cti1 input').nth(0)).toHaveAttribute('placeholder', '开始时间');
      await softExpect(page.locator('#cti1 input').nth(1)).toHaveAttribute('placeholder', '结束时间');
    });

    await test.step('禁用状态下输入框不可编辑', async () => {
      await softExpect(page.locator('#cti2 input').nth(0)).toBeDisabled();
      await softExpect(page.locator('#cti2 input').nth(1)).toBeDisabled();
    });
  });

  test('输入触发 change 与非法字符清理', async ({ page }) => {
    await openPlayground(page);
    const cti = page.locator('#cti1');
    const log = page.locator('#cuttime-log');

    await test.step('修改第一个时间', async () => {
      await cti.locator('input').nth(0).fill('00:01:30');
      await softExpect(log).toContainText('CutTimeInput → [00:01:30, 00:00:20.00]');
    });

    await test.step('修改第二个时间', async () => {
      await cti.locator('input').nth(1).fill('00:02:45.5');
      await softExpect(log).toContainText('CutTimeInput → [00:01:30, 00:02:45.5]');
    });

    await test.step('durationFixer 剔除输入的字母', async () => {
      const first = cti.locator('input').nth(0);
      await first.fill('00:0a1:30');
      await softExpect(first).toHaveValue('00:01:30');
    });
  });

  test('非法时间高亮', async ({ page }) => {
    await openPlayground(page);
    const input = page.locator('#cti1 input').nth(0);
    const background = page.locator('#cti1 .inputbox-selectorBackground-wrapper > div');

    await test.step('合法输入不带 errorBorder', async () => {
      await input.fill('00:01:30');
      await softExpect(background).not.toHaveAttribute('style', /errorBorder/);
    });

    await test.step('非法输入（分秒越界）加红边红影', async () => {
      await input.fill('99:99:99');
      await softExpect(background).toHaveCSS('border-top-color', 'rgb(238, 119, 119)');
      await softExpect(background).toHaveCSS('box-shadow', /rgba\(255, 51, 51, 0\.3\)/);
    });

    await test.step('修正后恢复', async () => {
      await input.fill('00:00:01');
      await softExpect(background).not.toHaveAttribute('style', /errorBorder/);
    });
  });

  test('清空按钮', async ({ page }) => {
    await openPlayground(page);
    const cti = page.locator('#cti1');
    const clearWrapper = cti.locator('.hiddenButton');
    const clear = clearWrapper.locator('ffbox-button');
    const log = page.locator('#cuttime-log');

    await test.step('未悬停时透明且不拦截事件', async () => {
      await softExpect(clearWrapper).toHaveCSS('opacity', '0');
      await softExpect(clearWrapper).toHaveCSS('pointer-events', 'none');
    });

    await test.step('悬停操作区后滑出并可点击', async () => {
      await cti.locator('.opButton').hover();
      await softExpect(clearWrapper).toHaveCSS('opacity', '1');
      await softExpect(clearWrapper).toHaveCSS('pointer-events', 'auto');
    });

    await test.step('点击清空两个输入框', async () => {
      await clear.click();
      await softExpect(log).toContainText('CutTimeInput → [, ]');
      await softExpect(cti.locator('input').nth(0)).toHaveValue('');
      await softExpect(cti.locator('input').nth(1)).toHaveValue('');
    });
  });

  test('编辑按钮与 Enter', async ({ page }) => {
    await openPlayground(page);
    const cti = page.locator('#cti1');
    const log = page.locator('#cuttime-log');

    await test.step('点击编辑按钮触发回调', async () => {
      await cti.locator('.opButton ffbox-button').last().click();
      await softExpect(log).toContainText('CutTimeInput 编辑按钮');
    });

    await test.step('输入框内回车触发 enter', async () => {
      await cti.locator('input').nth(0).press('Enter');
      await softExpect(log).toContainText('CutTimeInput Enter');
    });
  });
});

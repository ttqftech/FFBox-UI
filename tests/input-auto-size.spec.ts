import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-input-auto-size', () => {
  test('渲染、事件与宽度自适应', async ({ page }) => {
    await openPlayground(page);
    const innerA = page.locator('#autoA input');
    const log = page.locator('#autosize-log');

    await test.step('初始值正确渲染', async () => {
      await softExpect(page.locator('#autoA')).toBeVisible();
      await softExpect(innerA).toHaveValue('abc');
    });

    await test.step('输入触发 input 事件', async () => {
      await innerA.click();
      await innerA.fill('hello');
      await softExpect(log).toContainText('AutoSize input → "hello"');
    });

    await test.step('回车触发 press-enter 事件', async () => {
      await innerA.press('Enter');
      await softExpect(log).toContainText('AutoSize Enter');
    });

    await test.step('空值渲染', async () => {
      await softExpect(page.locator('#autoB input')).toHaveValue('');
    });

    await test.step('宽度随文本变长而增大、变短而回缩', async () => {
      await innerA.click();
      await innerA.fill('a');
      await page.waitForTimeout(100);
      const widthShort = await innerA.evaluate(el => el.offsetWidth);

      await innerA.fill('abcdefghij');
      await page.waitForTimeout(100);
      const widthLong = await innerA.evaluate(el => el.offsetWidth);
      softExpect(widthLong).toBeGreaterThan(widthShort);

      await innerA.fill('ab');
      await page.waitForTimeout(100);
      const widthMedium = await innerA.evaluate(el => el.offsetWidth);
      softExpect(widthMedium).toBeGreaterThan(widthShort);
      softExpect(widthMedium).toBeLessThan(widthLong);
    });
  });
});

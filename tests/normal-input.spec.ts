import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-normal-input', () => {
  test('渲染、事件与校验器', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#input-log');

    await test.step('初始值正确渲染', async () => {
      await softExpect(page.locator('#inputA')).toBeVisible();
      await softExpect(page.locator('#inputA input')).toHaveValue('hello');
    });

    await test.step('回车触发 enter 事件', async () => {
      const innerA = page.locator('#inputA input');
      await innerA.click();
      await innerA.press('Enter');
      await softExpect(log).toContainText('Input Enter');
    });

    await test.step('placeholder 正确显示', async () => {
      await softExpect(page.locator('#inputB input')).toHaveAttribute('placeholder', '请输入内容');
    });

    await test.step('输入触发 change 事件', async () => {
      const innerB = page.locator('#inputB input');
      await innerB.click();
      await innerB.fill('test');
      await softExpect(log).toContainText('Input → "test"');
    });

    await test.step('禁用输入框不接受输入', async () => {
      await softExpect(page.locator('#inputC input')).toBeDisabled();
    });

    await test.step('整数校验器：合法值不带 invalid', async () => {
      await softExpect(page.locator('#inputD input')).toHaveValue('42');
      await softExpect(page.locator('#inputD .inputbox-selector')).not.toHaveClass(/invalid/);
    });

    await test.step('整数校验器：非整数标红', async () => {
      const innerD = page.locator('#inputD input');
      await innerD.click();
      await innerD.fill('3.14');
      await innerD.blur();
      await softExpect(page.locator('#inputD .inputbox-selector')).toHaveClass(/invalid/);
    });

    await test.step('数字校验器：初始非法值标红，修正后恢复', async () => {
      const innerE = page.locator('#inputE input');
      await softExpect(innerE).toHaveValue('3.14a');
      await softExpect(page.locator('#inputE .inputbox-selector')).toHaveClass(/invalid/);

      await innerE.click();
      await innerE.fill('3.14');
      await innerE.blur();
      await softExpect(page.locator('#inputE .inputbox-selector')).not.toHaveClass(/invalid/);
    });

    await test.step('数字校验器：非数字标红', async () => {
      const innerE = page.locator('#inputE input');
      await innerE.click();
      await innerE.fill('abc');
      await innerE.blur();
      await softExpect(page.locator('#inputE .inputbox-selector')).toHaveClass(/invalid/);
    });

    await test.step('inputFixer 剔除非数字字符', async () => {
      const innerF = page.locator('#inputF input');
      await innerF.click();
      await innerF.fill('a3b5c');
      await softExpect(log).toContainText('Input → "35"');
    });

    await test.step('禁用 + 非法值：同时呈现禁用态与标红且半透明', async () => {
      const innerG = page.locator('#inputG input');
      const wrapperG = page.locator('#inputG .inputbox-selector');
      await softExpect(innerG).toBeDisabled();
      await softExpect(innerG).toHaveValue('abc');
      await softExpect(wrapperG).toHaveClass(/invalid/);
      const opacity = await wrapperG.evaluate(el => getComputedStyle(el).opacity);
      softExpect(Number(opacity)).toBeLessThan(1);
    });
  });
});

import { test, expect } from '@playwright/test';

test('ffbox-cut-time-input 渲染与初值', async ({ page }) => {
  await page.goto('/playground/');

  const cti = page.locator('#cti1');
  await expect(cti).toBeVisible();

  const inputs = cti.locator('input');
  await expect(inputs).toHaveCount(2);
  await expect(inputs.nth(0)).toHaveValue('00:00:10.00');
  await expect(inputs.nth(1)).toHaveValue('00:00:20.00');

  // placeholder 取自 placeholder 属性
  const cti2 = page.locator('#cti2');
  await expect(cti2.locator('input').nth(0)).toHaveValue('00:01:00');
  // 禁用状态下输入框不可编辑
  await expect(cti2.locator('input').nth(0)).toBeDisabled();
});

test('ffbox-cut-time-input 输入触发 change', async ({ page }) => {
  await page.goto('/playground/');

  const cti = page.locator('#cti1');
  const log = page.locator('#cuttime-log');

  await cti.locator('input').nth(0).fill('00:01:30');
  await expect(log).toContainText('CutTimeInput → [00:01:30, 00:00:20.00]');

  await cti.locator('input').nth(1).fill('00:02:45.5');
  await expect(log).toContainText('CutTimeInput → [00:01:30, 00:02:45.5]');
});

test('ffbox-cut-time-input durationFixer 清理非法字符', async ({ page }) => {
  await page.goto('/playground/');

  const first = page.locator('#cti1 input').nth(0);
  // durationFixer 会剔除小写字母，输入后的值应为清理结果
  await first.fill('00:0a1:30');
  await expect(first).toHaveValue('00:01:30');
});

test('ffbox-cut-time-input 非法时间高亮', async ({ page }) => {
  await page.goto('/playground/');

  const cti = page.locator('#cti1');
  const background = cti.locator('.inputbox-selectorBackground-wrapper > div');

  // 合法输入：不带 errorBorder
  await cti.locator('input').nth(0).fill('00:01:30');
  await expect(background).not.toHaveAttribute('style', /errorBorder/);

  // 非法输入（分秒越界）：背景层加红边红影（--errorBorder = #E77）
  await cti.locator('input').nth(0).fill('99:99:99');
  await expect(background).toHaveCSS('border-top-color', 'rgb(238, 119, 119)');
  await expect(background).toHaveCSS('box-shadow', /rgba\(255, 51, 51, 0\.3\)/);

  // 修正后恢复
  await cti.locator('input').nth(0).fill('00:00:01');
  await expect(background).not.toHaveAttribute('style', /errorBorder/);
});

test('ffbox-cut-time-input 清空按钮', async ({ page }) => {
  await page.goto('/playground/');

  const cti = page.locator('#cti1');
  const clearWrapper = cti.locator('.hiddenButton');
  const clear = clearWrapper.locator('ffbox-button');
  const log = page.locator('#cuttime-log');

  // 悬停前不可点击（透明层不拦截事件）
  await expect(clearWrapper).toHaveCSS('opacity', '0');
  await expect(clearWrapper).toHaveCSS('pointer-events', 'none');

  // 悬停操作区后清空按钮滑出并可点击
  await cti.locator('.opButton').hover();
  await expect(clearWrapper).toHaveCSS('opacity', '1');
  await expect(clearWrapper).toHaveCSS('pointer-events', 'auto');

  await clear.click();
  await expect(log).toContainText('CutTimeInput → [, ]');
  await expect(cti.locator('input').nth(0)).toHaveValue('');
  await expect(cti.locator('input').nth(1)).toHaveValue('');
});

test('ffbox-cut-time-input 编辑按钮与 Enter', async ({ page }) => {
  await page.goto('/playground/');

  const cti = page.locator('#cti1');
  const log = page.locator('#cuttime-log');

  await cti.locator('.opButton ffbox-button').last().click();
  await expect(log).toContainText('CutTimeInput 编辑按钮');

  await cti.locator('input').nth(0).press('Enter');
  await expect(log).toContainText('CutTimeInput Enter');
});

import { test, expect } from '@playwright/test';

test('ffbox-radio-list 选择', async ({ page }) => {
  await page.goto('/playground/');

  const rl = page.locator('#rl1');
  const items = rl.locator('.item');

  // 渲染 7 项
  await expect(items).toHaveCount(7);

  // 点击选中第 0 项
  await items.nth(0).click();
  await expect(rl.locator('.itemSelected .itemLabel')).toHaveText('普通 1（自定义 caption）');

  // 点击切换选中
  await items.nth(1).click();
  await expect(rl.locator('.itemSelected .itemLabel')).toHaveText('普通 2');

  const log = page.locator('#radiolist-log');
  await items.nth(2).click();
  await expect(log).toContainText('RadioList → 可删除 (index 2)');
});

test('ffbox-radio-list 删除', async ({ page }) => {
  await page.goto('/playground/');

  const items = page.locator('#rl1 .item');

  // 仅 deletable 项渲染删除按钮（含 SVG）
  await expect(items.nth(0).locator('.itemDelete')).toHaveCount(0);
  await expect(items.nth(2).locator('.itemDelete svg')).toHaveCount(1);

  // 点击删除触发事件
  const log = page.locator('#radiolist-log');
  await items.nth(2).locator('.itemDelete').click();
  await expect(log).toContainText('RadioList delete → 可删除');
});

test('ffbox-radio-list 编辑', async ({ page }) => {
  await page.goto('/playground/');

  const item = page.locator('#rl1 .item').nth(3);

  // 先选中该项，再点击 label 进入编辑
  await item.click();
  await item.locator('.itemLabel').click();
  const input = item.locator('ffbox-input-auto-size input');
  await expect(input).toBeVisible();

  // 三击全选 → 输入新值 → Enter 确认
  await input.click({ clickCount: 3 });
  await page.keyboard.type('edited');
  await page.keyboard.press('Enter');

  // edit 事件写入日志，且退出编辑模式
  const log = page.locator('#radiolist-log');
  await expect(log).toContainText('RadioList edit → "可编辑" → "edited"');
  await expect(item.locator('ffbox-input-auto-size')).toHaveCount(0);
});

test('ffbox-radio-list 禁用', async ({ page }) => {
  await page.goto('/playground/');

  const item = page.locator('#rl1 .item').nth(5);

  // 禁用项带 itemDisabled class 且 pointer-events: none
  await expect(item).toHaveClass(/itemDisabled/);
  await expect(item).toHaveCSS('pointer-events', 'none');
});
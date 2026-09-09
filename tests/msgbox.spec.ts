import { test, expect } from '@playwright/test';

async function waitForMsgboxReady(page: import('@playwright/test').Page) {
  await expect(page.locator('ffbox-msgbox .box.entered')).toBeVisible();
}

test('ffbox-msgbox 单按钮下 Esc 直接触发该按钮', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#msgboxSingle').click();
  const msgbox = page.locator('ffbox-msgbox');
  await expect(msgbox).toBeVisible();
  await expect(msgbox.locator('.title')).toHaveText('提示');
  await expect(msgbox.locator('.content')).toContainText('只有一个按钮的对话框');

  // 单按钮模式下 Escape 直接触发该按钮
  await waitForMsgboxReady(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#msgbox-log')).toContainText('Msgbox 单按钮 → 确定');
  await expect(msgbox).toHaveCount(0);
});

test('ffbox-msgbox 点击按钮关闭', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#msgboxConfirm').click();
  const msgbox = page.locator('ffbox-msgbox');
  await expect(msgbox).toBeVisible();

  await msgbox.locator('ffbox-button', { hasText: '确定' }).click();
  await expect(page.locator('#msgbox-log')).toContainText('Msgbox → 确定');
  // 离场动画结束后自动从 DOM 移除
  await expect(msgbox).toHaveCount(0);
});

test('ffbox-msgbox 键盘 Esc / Enter 命中 role', async ({ page }) => {
  await page.goto('/playground/');

  const log = page.locator('#msgbox-log');

  // Escape → cancel
  await page.locator('#msgboxConfirm').click();
  await waitForMsgboxReady(page);
  await page.keyboard.press('Escape');
  await expect(log).toContainText('Msgbox → 取消');
  await expect(page.locator('ffbox-msgbox')).toHaveCount(0);

  // Enter → confirm
  await page.locator('#msgboxConfirm').click();
  await waitForMsgboxReady(page);
  await page.keyboard.press('Enter');
  await expect(log).toContainText('Msgbox → 确定');
  await expect(page.locator('ffbox-msgbox')).toHaveCount(0);
});

test('ffbox-msgbox 异步回调完成后关闭', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#msgboxAsync').click();
  const msgbox = page.locator('ffbox-msgbox');
  await expect(msgbox).toBeVisible();
  await expect(msgbox.locator('.image svg')).toHaveCount(1);

  const deleteBtn = msgbox.locator('ffbox-button', { hasText: '删除' });
  await deleteBtn.click();

  // Promise 未 resolve 前弹窗保留，且按钮被禁用
  await expect(msgbox).toHaveCount(1);
  await expect(deleteBtn).toHaveAttribute('disabled', '');

  await expect(page.locator('#msgbox-log')).toContainText('Msgbox 异步回调完成');
  await expect(msgbox).toHaveCount(0);
});

test('ffbox-msgbox 遮罩按下时弹窗回弹', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#msgboxConfirm').click();
  const box = page.locator('ffbox-msgbox .box');
  await expect(box).toBeVisible();

  // 遮罩 mousedown 时盒子缩小，mouseup 后还原（取左上角坐标，避开居中的 box）
  await page.mouse.move(4, 4);
  await page.mouse.down();
  await expect(box).toHaveCSS('transform', /matrix\(0\.9/);
  await page.mouse.up();
  await expect(box).toHaveCSS('transform', /matrix\(1,\s*0,\s*0,\s*1/);
});

test('ffbox-msgbox 不传 buttons 时使用默认按钮', async ({ page }) => {
  await page.goto('/playground/');

  await page.evaluate(async () => {
    const { FFBoxMsgbox } = await import('/src/ffbox-ui.js');
    FFBoxMsgbox.show({ title: '默认按钮', content: '只有一个好嘅' });
  });

  const msgbox = page.locator('ffbox-msgbox');
  await expect(msgbox.locator('ffbox-button')).toHaveCount(1);
  await expect(msgbox.locator('ffbox-button')).toHaveText('好嘅');

  await msgbox.locator('ffbox-button').click();
  await expect(msgbox).toHaveCount(0);
});

test('ffbox-msgbox 同时打开两个弹窗，关闭上层后焦点回到下层', async ({ page }) => {
  await page.goto('/playground/');

  const log = page.locator('#msgbox-log');
  const msgboxes = page.locator('ffbox-msgbox');

  await page.locator('#msgboxStack').click();
  await expect(msgboxes).toHaveCount(2);
  await expect(msgboxes.last().locator('.box.entered')).toBeVisible();

  // Enter 应关闭上层弹窗（role=confirm）
  await page.keyboard.press('Enter');
  await expect(log).toContainText('上层弹窗 → 确定');
  await expect(msgboxes).toHaveCount(1);

  // 焦点已回到底层弹窗，Enter 应关闭它
  await page.keyboard.press('Enter');
  await expect(log).toContainText('底层弹窗 → 确定');
  await expect(msgboxes).toHaveCount(0);
});
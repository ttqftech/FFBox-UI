import { test, expect } from '@playwright/test';

test('ffbox-popup 弹出与内容', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#popupNormal').click();
  const popup = page.locator('ffbox-popup');
  await expect(popup).toBeVisible();
  await expect(popup.locator('.popup-message')).toContainText('这是一条普通气泡通知');
  // 多行消息渲染为 <br>
  await expect(popup.locator('.popup-message br')).toHaveCount(1);
});

test('ffbox-popup 等级样式', async ({ page }) => {
  await page.goto('/playground/');

  // 白（无额外类）
  await page.locator('#popupNormal').click();
  await expect(page.locator('ffbox-popup .popup-box')).not.toHaveClass(/popup-(ok|warning|error)/);

  // 绿 / 黄 / 红
  await page.locator('#popupOk').click();
  await expect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-ok/);
  await page.locator('#popupWarning').click();
  await expect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-warning/);
  await page.locator('#popupError').click();
  await expect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-error/);
});

test('ffbox-popup 多条堆叠', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#popupNormal').click();
  await page.locator('#popupOk').click();
  await expect(page.locator('ffbox-popup')).toHaveCount(2);

  // 最新的一条在最下方（translateY(0)），较早的一条被上推
  await page.waitForTimeout(100);
  const translateY = (index: number) => page.locator('ffbox-popup').nth(index).evaluate(el => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return m.m42;
  });
  expect(await translateY(1)).toBe(0);
  expect(await translateY(0)).toBeLessThan(0);
});

test('ffbox-popup 点击关闭按钮消失', async ({ page }) => {
  await page.goto('/playground/');

  await page.locator('#popupNormal').click();
  const popup = page.locator('ffbox-popup');
  await expect(popup).toBeVisible();

  // 悬停后进度环隐藏、关闭按钮显现
  const box = popup.locator('.popup-box');
  const closeBtn = popup.locator('.popup-progress-x');
  await box.hover();
  await expect(closeBtn).toHaveCSS('opacity', '1');

  await closeBtn.click();
  await expect(popup).toHaveCount(0);
});

test('ffbox-popup 鼠标悬停暂停倒计时', async ({ page }) => {
  await page.goto('/playground/');

  await page.evaluate(async () => {
    const { FFBoxPopup } = await import('/src/ffbox-ui.js');
    FFBoxPopup.show({ message: 'hover' });
  });

  const popup = page.locator('ffbox-popup');
  await expect(popup).toBeVisible();
  const circle = popup.locator('.popup-progress-circle circle');

  await popup.locator('.popup-box').hover();
  const offset1 = await circle.getAttribute('stroke-dashoffset');
  await page.waitForTimeout(1200);
  const offset2 = await circle.getAttribute('stroke-dashoffset');

  // 悬停时 timeLeft 被回补，进度环不再推进（甚至回退）
  expect(Number(offset2)).toBeGreaterThanOrEqual(Number(offset1));
  await expect(popup).toHaveCount(1);
});

test('ffbox-popup 倒计时结束自动关闭', async ({ page }) => {
  await page.goto('/playground/');

  await page.evaluate(async () => {
    const { FFBoxPopup } = await import('/src/ffbox-ui.js');
    FFBoxPopup.show({ message: 'x' });	// 2500 + 1 * 100 = 2600ms
  });

  const popup = page.locator('ffbox-popup');
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCount(0, { timeout: 8000 });
});

test('ffbox-popup 一次性弹出 40 条时上限为 30', async ({ page }) => {
  await page.goto('/playground/');

  await page.evaluate(async () => {
    const { FFBoxPopup } = await import('/src/ffbox-ui.js');
    for (let i = 0; i < 40; i++) {
      FFBoxPopup.show({ message: `批量气泡 #${i + 1}`, level: (i % 4) as 0 | 1 | 2 | 3 });
    }
  });

  const popups = page.locator('ffbox-popup');
  await expect(popups).toHaveCount(30, { timeout: 5000 });

  const messages = popups.locator('.popup-message');
  const firstText = await messages.first().textContent();
  const lastText = await messages.last().textContent();
  expect(firstText).toBeTruthy();
  expect(lastText).toBeTruthy();
});
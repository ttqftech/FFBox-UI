import { test, expect } from '@playwright/test';

test('ffbox-rocker-switch', async ({ page }) => {
  await page.goto('/playground/');

  // renders rocker switch
  const rs = page.locator('ffbox-rocker-switch').first();
  await expect(rs).toBeVisible();

  // renders with label text
  const rs1 = page.locator('#rs1');
  await expect(rs1).toContainText('帧率');

  // clicking left arrow fires left
  await rs1.locator('.arrowLeft').click();
  const log = page.locator('#rocker-log');
  await expect(log).toContainText('Rocker ← left');

  // clicking right arrow fires right
  await rs1.locator('.arrowRight').click();
  await expect(log).toContainText('Rocker → right');

  // disabled-left prevents left click
  const rsDisabledLeft = page.locator('ffbox-rocker-switch[disabled-left]').first();
  const leftBtn = rsDisabledLeft.locator('.arrowLeft');
  await expect(leftBtn).toBeDisabled();

  // disabled-right prevents right click
  const rsDisabledRight = page.locator('ffbox-rocker-switch[disabled-right]').first();
  const rightBtn = rsDisabledRight.locator('.arrowRight');
  await expect(rightBtn).toBeDisabled();
});

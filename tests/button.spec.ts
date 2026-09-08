import { test, expect } from '@playwright/test';

test('ffbox-button', async ({ page }) => {
  await page.goto('/playground/');

  // renders with default text
  const button = page.locator('ffbox-button').first();
  await expect(button).toBeVisible();
  const text = await button.evaluate((el: HTMLElement) => el.textContent?.trim());
  expect(text).toBe('普通按钮');

  // renders different types
  const buttons = page.locator('ffbox-button');
  await expect(buttons).toHaveCount(10);

  // disabled button does not fire click
  const disabledBtn = page.locator('ffbox-button[disabled]').first();
  await disabledBtn.click();
  const log = page.locator('#button-log');
  await expect(log).toHaveText('');

  // clicking normal button fires click
  const btn = page.locator('ffbox-button').first();
  await btn.click();
  await expect(log).toContainText('Button clicked');

  // renders primary type with correct class
  const primaryBtn = page.locator('ffbox-button[type="primary"]').first();
  const innerBtn = primaryBtn.locator('button');
  await expect(innerBtn).toHaveClass(/primary/);

  // renders small size with correct class
  const smallBtn = page.locator('ffbox-button[size="small"]').first();
  const innerSmallBtn = smallBtn.locator('button');
  await expect(innerSmallBtn).toHaveClass(/small/);
});

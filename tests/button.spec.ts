import { test, expect } from '@playwright/test';

test.describe('ffbox-button', () => {
  test('renders with default text', async ({ page }) => {
    await page.goto('/playground/');
    const button = page.locator('ffbox-button').first();
    await expect(button).toBeVisible();
    const text = await button.evaluate((el: HTMLElement) => el.textContent?.trim());
    expect(text).toBe('普通按钮');
  });

  test('renders different types', async ({ page }) => {
    await page.goto('/playground/');
    const buttons = page.locator('ffbox-button');
    await expect(buttons).toHaveCount(9);
  });

  test('disabled button does not fire ffbox-click', async ({ page }) => {
    await page.goto('/playground/');
    const disabledBtn = page.locator('ffbox-button[disabled]').first();
    const clickPromise = page.waitForEvent('page', { timeout: 500 }).catch(() => null);
    await disabledBtn.click();
    const log = page.locator('#button-log');
    await expect(log).toHaveText('');
  });

  test('clicking normal button fires ffbox-click', async ({ page }) => {
    await page.goto('/playground/');
    const btn = page.locator('ffbox-button').first();
    await btn.click();
    const log = page.locator('#button-log');
    await expect(log).toContainText('Button clicked');
  });

  test('renders primary type with correct class', async ({ page }) => {
    await page.goto('/playground/');
    const primaryBtn = page.locator('ffbox-button[type="primary"]').first();
    const innerBtn = primaryBtn.locator('button');
    await expect(innerBtn).toHaveClass(/primary/);
  });

  test('renders small size with correct class', async ({ page }) => {
    await page.goto('/playground/');
    const smallBtn = page.locator('ffbox-button[size="small"]').first();
    const innerBtn = smallBtn.locator('button');
    await expect(innerBtn).toHaveClass(/small/);
  });
});
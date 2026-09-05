import { test, expect } from '@playwright/test';

test.describe('ffbox-checkbox', () => {
  test('renders checkbox', async ({ page }) => {
    await page.goto('/playground/');
    const cb = page.locator('ffbox-checkbox').first();
    await expect(cb).toBeVisible();
  });

  test('clicking unchecked checkbox selects it', async ({ page }) => {
    await page.goto('/playground/');
    const cb1 = page.locator('#cb1');
    await cb1.click();
    const log = page.locator('#checkbox-log');
    await expect(log).toContainText('Checkbox → true');
  });

  test('clicking checked checkbox deselects it', async ({ page }) => {
    await page.goto('/playground/');
    const cb2 = page.locator('#cb2');
    await cb2.click();
    const log = page.locator('#checkbox-log');
    await expect(log).toContainText('Checkbox → false');
  });

  test('disabled checkbox does not respond to click', async ({ page }) => {
    await page.goto('/playground/');
    const disabledCb = page.locator('ffbox-checkbox[disabled]').first();
    await disabledCb.click();
    const log = page.locator('#checkbox-log');
    await expect(log).toHaveText('');
  });
});

test.describe('ffbox-radio', () => {
  test('renders radio', async ({ page }) => {
    await page.goto('/playground/');
    const r = page.locator('ffbox-radio').first();
    await expect(r).toBeVisible();
  });

  test('clicking unchecked radio selects it', async ({ page }) => {
    await page.goto('/playground/');
    const r1 = page.locator('#r1');
    await r1.click();
    const log = page.locator('#radio-log');
    await expect(log).toContainText('Radio → true');
  });

  test('clicking checked radio deselects it', async ({ page }) => {
    await page.goto('/playground/');
    const r2 = page.locator('#r2');
    await r2.click();
    const log = page.locator('#radio-log');
    await expect(log).toContainText('Radio → false');
  });
});
import { test, expect } from '@playwright/test';

test.describe('ffbox-switch', () => {
  test('renders switch', async ({ page }) => {
    await page.goto('/playground/');
    const sw = page.locator('ffbox-switch').first();
    await expect(sw).toBeVisible();
  });

  test('initial state matches attribute', async ({ page }) => {
    await page.goto('/playground/');
    const switchA = page.locator('#switchA');
    const switchB = page.locator('#switchB');
    await expect(switchA).not.toHaveAttribute('checked', '');
    await expect(switchB).toHaveAttribute('checked', '');
  });

  test('clicking switch toggles state', async ({ page }) => {
    await page.goto('/playground/');
    const switchA = page.locator('#switchA');
    const valueSpan = page.locator('#switchA-value');
    await expect(valueSpan).toHaveText('false');

    await switchA.click();
    await expect(valueSpan).toHaveText('true');

    await switchA.click();
    await expect(valueSpan).toHaveText('false');
  });

  test('fires ffbox-change event', async ({ page }) => {
    await page.goto('/playground/');
    const switchA = page.locator('#switchA');
    await switchA.click();
    const log = page.locator('#switch-log');
    await expect(log).toContainText('Switch A → true');
  });

  test('slipper position changes with checked state', async ({ page }) => {
    await page.goto('/playground/');
    const switchA = page.locator('#switchA');
    const slipper = switchA.locator('.switch-slipper');

    await expect(slipper).toHaveCSS('left', '0px');

    await switchA.click();
    await expect(slipper).toHaveCSS('left', '64px');
  });
});
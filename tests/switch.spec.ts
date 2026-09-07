import { test, expect } from '@playwright/test';

test('ffbox-switch', async ({ page }) => {
  await page.goto('/playground/');

  // renders switch
  const sw = page.locator('ffbox-switch').first();
  await expect(sw).toBeVisible();

  // initial state matches attribute
  const switchA = page.locator('#switchA');
  const switchB = page.locator('#switchB');
  await expect(switchA).not.toHaveAttribute('checked', '');
  await expect(switchB).toHaveAttribute('checked', '');

  // clicking switch toggles state and slipper position changes
  const valueSpan = page.locator('#switchA-value');
  await expect(valueSpan).toHaveText('false');

  const slipper = switchA.locator('.switch-slipper');
  await expect(slipper).toHaveCSS('left', '0px');

  await switchA.click();
  await expect(valueSpan).toHaveText('true');
  await expect(slipper).toHaveCSS('left', '64px');

  const log = page.locator('#switch-log');
  await expect(log).toContainText('Switch A → true');

  await switchA.click();
  await expect(valueSpan).toHaveText('false');
});

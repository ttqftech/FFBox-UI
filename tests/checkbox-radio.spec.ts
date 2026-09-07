import { test, expect } from '@playwright/test';

test('ffbox-checkbox', async ({ page }) => {
  await page.goto('/playground/');

  // renders checkbox
  const cb = page.locator('ffbox-checkbox').first();
  await expect(cb).toBeVisible();

  // clicking unchecked checkbox selects it
  const cb1 = page.locator('#cb1');
  await cb1.click();
  const log = page.locator('#checkbox-log');
  await expect(log).toContainText('Checkbox → true');

  // clicking checked checkbox deselects it
  const cb2 = page.locator('#cb2');
  await cb2.click();
  await expect(log).toContainText('Checkbox → false');

  // disabled checkbox does not respond to click
  const disabledCb = page.locator('ffbox-checkbox[disabled]').first();
  await disabledCb.click();
  await expect(log).toContainText('Checkbox → false');
});

test('ffbox-radio', async ({ page }) => {
  await page.goto('/playground/');

  // renders radio
  const r = page.locator('ffbox-radio').first();
  await expect(r).toBeVisible();

  // clicking unchecked radio selects it
  const r1 = page.locator('#r1');
  await r1.click();
  const log = page.locator('#radio-log');
  await expect(log).toContainText('Radio → true');

  // clicking checked radio deselects it
  const r2 = page.locator('#r2');
  await r2.click();
  await expect(log).toContainText('Radio → false');
});

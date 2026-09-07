import { test, expect } from '@playwright/test';

test('ffbox-input-auto-size', async ({ page }) => {
  await page.goto('/playground/');

  // renders with initial value
  const autoA = page.locator('#autoA');
  await expect(autoA).toBeVisible();
  const innerA = autoA.locator('input');
  await expect(innerA).toHaveValue('abc');

  // typing fires input event
  const log = page.locator('#autosize-log');
  await innerA.click();
  await innerA.fill('hello');
  await expect(log).toContainText('AutoSize input → "hello"');

  // enter fires press-enter event
  await innerA.press('Enter');
  await expect(log).toContainText('AutoSize Enter');

  // empty value renders
  const autoB = page.locator('#autoB');
  const innerB = autoB.locator('input');
  await expect(innerB).toHaveValue('');

  // input width grows with longer text and shrinks with shorter text
  await innerA.click();
  await innerA.fill('a');
  await page.waitForTimeout(100);
  const widthShort = await innerA.evaluate(el => el.offsetWidth);

  await innerA.fill('abcdefghij');
  await page.waitForTimeout(100);
  const widthLong = await innerA.evaluate(el => el.offsetWidth);
  expect(widthLong).toBeGreaterThan(widthShort);

  await innerA.fill('ab');
  await page.waitForTimeout(100);
  const widthMedium = await innerA.evaluate(el => el.offsetWidth);
  expect(widthMedium).toBeGreaterThan(widthShort);
  expect(widthMedium).toBeLessThan(widthLong);
});
import { test, expect } from '@playwright/test';

test('ffbox-control-box', async ({ page }) => {
  await page.goto('/playground/');

  // renders control box
  const cb1 = page.locator('#ctrlbox1');
  await expect(cb1).toBeVisible();

  // renders title text
  const title = cb1.locator('.controlBox-title');
  await expect(title).toHaveText('普通');

  // non-optional control box does not show checkbox
  const checkbox = cb1.locator('ffbox-checkbox');
  await expect(checkbox).toHaveCount(0);

  // optional control box shows checkbox
  const cb2 = page.locator('#ctrlbox2');
  const optionalCheckbox = cb2.locator('ffbox-checkbox');
  await expect(optionalCheckbox).toHaveCount(1);

  // optional control box with has-value shows checked checkbox
  await expect(optionalCheckbox).toHaveAttribute('checked', '');

  // clicking optional checkbox fires enabled-change event
  const log = page.locator('#controlbox-log');
  await optionalCheckbox.click();
  await expect(log).toContainText('ControlBox enabled → false');

  // long variant renders
  const cb3 = page.locator('#ctrlbox3');
  await expect(cb3).toBeVisible();
  const longTitle = cb3.locator('.controlBox-title');
  await expect(longTitle).toHaveText('长选项');

  // description is set as title attribute
  await expect(cb2.locator('.controlBox-title')).toHaveAttribute('title', '带开关');
});

test('ffbox-control-box layout', async ({ page }) => {
  await page.goto('/playground/');

  // non-optional, non-long: width=210px, margin-right=28px
  const cb1Box = page.locator('#ctrlbox1');
  await expect(cb1Box).toHaveCSS('width', '210px');
  await expect(cb1Box).toHaveCSS('margin-right', '28px');

  // optional, non-long, has-value: width=210px, margin-right=20px
  const cb2Box = page.locator('#ctrlbox2');
  await expect(cb2Box).toHaveCSS('width', '210px');
  await expect(cb2Box).toHaveCSS('margin-right', '20px');

  // long, non-optional: width=100% (computed), margin-right=20px
  const cb3Box = page.locator('#ctrlbox3');
  const cb3Width = await cb3Box.evaluate(el => getComputedStyle(el).width);
  expect(Number(cb3Width.replace('px', ''))).toBeGreaterThan(210);
  await expect(cb3Box).toHaveCSS('margin-right', '20px');
});

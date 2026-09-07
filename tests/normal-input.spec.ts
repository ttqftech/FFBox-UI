import { test, expect } from '@playwright/test';

test('ffbox-normal-input', async ({ page }) => {
  await page.goto('/playground/');

  // renders with initial value
  const inputA = page.locator('#inputA');
  await expect(inputA).toBeVisible();
  const innerA = inputA.locator('input');
  await expect(innerA).toHaveValue('hello');

  // enter fires enter event
  const log = page.locator('#input-log');
  await innerA.click();
  await innerA.press('Enter');
  await expect(log).toContainText('Input Enter');

  // placeholder is visible
  const inputB = page.locator('#inputB');
  const innerB = inputB.locator('input');
  await expect(innerB).toHaveAttribute('placeholder', '请输入内容');

  // typing fires change event
  await innerB.click();
  await innerB.fill('test');
  await expect(log).toContainText('Input → "test"');

  // disabled does not accept input
  const inputC = page.locator('#inputC');
  const innerC = inputC.locator('input');
  await expect(innerC).toBeDisabled();

  // integer validator passes for valid input
  const inputD = page.locator('#inputD');
  const innerD = inputD.locator('input');
  const wrapperD = inputD.locator('.inputbox-selector');
  await expect(innerD).toHaveValue('42');
  await expect(wrapperD).not.toHaveClass(/invalid/);

  // integer validator fails for non-integer
  await innerD.click();
  await innerD.fill('3.14');
  await innerD.blur();
  await expect(wrapperD).toHaveClass(/invalid/);

  // number validator shows error on initial invalid value
  const inputE = page.locator('#inputE');
  const innerE = inputE.locator('input');
  const wrapperE = inputE.locator('.inputbox-selector');
  await expect(innerE).toHaveValue('3.14a');
  await expect(wrapperE).toHaveClass(/invalid/);

  // number validator passes after correcting value
  await innerE.click();
  await innerE.fill('3.14');
  await innerE.blur();
  await expect(wrapperE).not.toHaveClass(/invalid/);

  // number validator fails for non-number
  await innerE.click();
  await innerE.fill('abc');
  await innerE.blur();
  await expect(wrapperE).toHaveClass(/invalid/);

  // inputFixer strips non-digits
  const inputF = page.locator('#inputF');
  const innerF = inputF.locator('input');
  await innerF.click();
  await innerF.fill('a3b5c');
  await expect(log).toContainText('Input → "35"');

  // disabled with invalid value shows both states
  const inputG = page.locator('#inputG');
  const innerG = inputG.locator('input');
  const wrapperG = inputG.locator('.inputbox-selector');
  await expect(innerG).toBeDisabled();
  await expect(innerG).toHaveValue('abc');
  await expect(wrapperG).toHaveClass(/invalid/);
  const opacity = await wrapperG.evaluate(el => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThan(1);
});
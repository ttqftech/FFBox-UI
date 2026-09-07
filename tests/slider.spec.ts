import { test, expect } from '@playwright/test';

test('ffbox-slider', async ({ page }) => {
  await page.goto('/playground/');

  // renders slider A with initial value 0.5
  const sliderA = page.locator('#sliderA');
  await expect(sliderA).toBeVisible();
  const slipperA = sliderA.locator('.slider-module-slipper');
  await expect(slipperA).toBeVisible();
  const valueSpanA = page.locator('#sliderA-value');
  await expect(valueSpanA).toContainText('0.5');

  // value attribute parsed as number (not string), slipper at 50% position
  const moduleBoxA = await sliderA.locator('.slider-module').boundingBox();
  const slipperBoxA = await slipperA.boundingBox();
  expect(moduleBoxA).not.toBeNull();
  expect(slipperBoxA).not.toBeNull();
  const relativePosA = ((slipperBoxA!.x + slipperBoxA!.width / 2) - moduleBoxA!.x) / moduleBoxA!.width;
  expect(relativePosA).toBeCloseTo(0.5, 1);

  // click on track updates value
  const log = page.locator('#slider-log');
  await sliderA.locator('.slider-module').click({ position: { x: 200, y: 28 } });
  await expect(log).toContainText('Slider A →');

  // slider B: integer adsorption, keyboard arrow changes value
  const sliderB = page.locator('#sliderB');
  const slipperB = sliderB.locator('.slider-module-slipper');
  const valueSpanB = page.locator('#sliderB-value');
  await expect(valueSpanB).toContainText('5');
  await slipperB.focus();
  await slipperB.press('ArrowRight');
  await expect(log).toContainText('Slider B → 6');
  await slipperB.press('ArrowLeft');
  await expect(log).toContainText('Slider B → 5');

  // adsorption=int snaps to integer on drag
  await sliderB.locator('.slider-module').click({ position: { x: 150, y: 28 } });
  await page.waitForTimeout(200);
  const logTextB = await log.textContent();
  const matchesB = logTextB?.match(/Slider B → (\d+)/);
  expect(matchesB).not.toBeNull();
  expect(Number.isInteger(Number(matchesB![1]))).toBe(true);

  // slider C: string mode, tags render marks
  const sliderC = page.locator('#sliderC');
  await sliderC.evaluate(el => {
    return new Promise<void>(resolve => {
      if ((el as any).tags?.length) { resolve(); return; }
      const check = () => { (el as any).tags?.length ? resolve() : requestAnimationFrame(check); };
      requestAnimationFrame(check);
    });
  });
  const marks = sliderC.locator('.slider-module-mark');
  await expect(marks).toHaveCount(5);
  await expect(marks.nth(0)).toContainText('低');
  await expect(marks.nth(4)).toContainText('无损');

  // string mode displays tag label not number
  const sliderTextC = sliderC.locator('.slider-text');
  await expect(sliderTextC).toContainText('中');

  // string mode slipper at correct position (value=1, min=0, max=4 → 25%)
  const slipperC = sliderC.locator('.slider-module-slipper');
  const moduleBoxC = await sliderC.locator('.slider-module').boundingBox();
  const slipperBoxC = await slipperC.boundingBox();
  expect(moduleBoxC).not.toBeNull();
  expect(slipperBoxC).not.toBeNull();
  const relativePosC = ((slipperBoxC!.x + slipperBoxC!.width / 2) - moduleBoxC!.x) / moduleBoxC!.width;
  expect(relativePosC).toBeCloseTo(0.25, 1);

  // string mode change emits tag label
  await slipperC.focus();
  await slipperC.press('ArrowRight');
  await page.waitForTimeout(200);
  const logTextC = await log.textContent();
  expect(logTextC).toContain('Slider C →');
  expect(logTextC).toMatch(/Slider C → (高|极高)/);

  // slider D: integer + tags adsorption
  const sliderD = page.locator('#sliderD');
  await sliderD.evaluate(el => {
    return new Promise<void>(resolve => {
      if ((el as any).tags?.length) { resolve(); return; }
      const check = () => { (el as any).tags?.length ? resolve() : requestAnimationFrame(check); };
      requestAnimationFrame(check);
    });
  });
  const marksD = sliderD.locator('.slider-module-mark');
  await expect(marksD).toHaveCount(5);
  await expect(marksD.nth(0)).toContainText('0');
  await expect(marksD.nth(4)).toContainText('100');
  const sliderTextD = sliderD.locator('.slider-text');
  await expect(sliderTextD).toContainText('50');

  // slider E: bitrate valueToDisplay object format
  const sliderE = page.locator('#sliderE');
  await sliderE.evaluate(el => {
    return new Promise<void>(resolve => {
      if ((el as any).valueToDisplay) { resolve(); return; }
      const check = () => { (el as any).valueToDisplay ? resolve() : requestAnimationFrame(check); };
      requestAnimationFrame(check);
    });
  });
  await page.waitForTimeout(100);
  const sliderTextE = sliderE.locator('.slider-text');
  await expect(sliderTextE).toContainText('Kbps');
});
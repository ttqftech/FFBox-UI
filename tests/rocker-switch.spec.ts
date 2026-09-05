import { test, expect } from '@playwright/test';

test.describe('ffbox-rocker-switch', () => {
  test('renders rocker switch', async ({ page }) => {
    await page.goto('/playground/');
    const rs = page.locator('ffbox-rocker-switch').first();
    await expect(rs).toBeVisible();
  });

  test('renders with label text', async ({ page }) => {
    await page.goto('/playground/');
    const rs1 = page.locator('#rs1');
    await expect(rs1).toContainText('帧率');
  });

  test('clicking left arrow fires ffbox-left', async ({ page }) => {
    await page.goto('/playground/');
    const rs1 = page.locator('#rs1');
    await rs1.locator('.arrowLeft').click();
    const log = page.locator('#rocker-log');
    await expect(log).toContainText('Rocker ← left');
  });

  test('clicking right arrow fires ffbox-right', async ({ page }) => {
    await page.goto('/playground/');
    const rs1 = page.locator('#rs1');
    await rs1.locator('.arrowRight').click();
    const log = page.locator('#rocker-log');
    await expect(log).toContainText('Rocker → right');
  });

  test('disabled-left prevents left click', async ({ page }) => {
    await page.goto('/playground/');
    const rs = page.locator('ffbox-rocker-switch[disabled-left]').first();
    const leftBtn = rs.locator('.arrowLeft');
    await expect(leftBtn).toBeDisabled();
  });

  test('disabled-right prevents right click', async ({ page }) => {
    await page.goto('/playground/');
    const rs = page.locator('ffbox-rocker-switch[disabled-right]').first();
    const rightBtn = rs.locator('.arrowRight');
    await expect(rightBtn).toBeDisabled();
  });
});
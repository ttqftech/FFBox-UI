import { test, expect } from '@playwright/test';

test('ffbox-tooltip Tooltip.show', async ({ page }) => {
  await page.goto('/playground/');

  const showBtn = page.locator('#tooltipShowBtn');
  await showBtn.hover();
  const tooltip = page.locator('ffbox-tooltip');
  const box = tooltip.locator('.tooltip-box');
  await expect(box).not.toHaveClass(/hidden/);
  await expect(tooltip.locator('.tooltip-message')).toContainText('通过 Tooltip.show 调用');

  await page.mouse.move(0, 0);
  await expect(box).toHaveClass(/hidden/);
});

test('ffbox-tooltip useTooltip', async ({ page }) => {
  await page.goto('/playground/');

  const useBtn = page.locator('#tooltipUseBtn');
  await useBtn.hover();
  const tooltip = page.locator('ffbox-tooltip');
  const box = tooltip.locator('.tooltip-box');
  await expect(box).not.toHaveClass(/hidden/);
  await expect(tooltip.locator('.tooltip-message')).toContainText('useTooltip 包裹');

  await page.mouse.move(0, 0);
  await expect(box).toHaveClass(/hidden/);
});
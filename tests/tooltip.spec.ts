import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-tooltip', () => {
  test('Tooltip.show 调用', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipShowBtn').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('通过 Tooltip.show 调用');
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });

  test('useTooltip 导出的函数应用在元素上', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipUseBtn').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('这是一条显示在元素下方的 tooltip');
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });

  test('useTooltip 上方', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipUseBtn2').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('这是一条显示在元素上方的 tooltip');
    });

    await test.step('气泡出现在按钮上方', async () => {
      const btnBox = await page.locator('#tooltipUseBtn2').boundingBox();
      const tipBox = await box.boundingBox();
      if (btnBox && tipBox) {
        await softExpect(tipBox.y + tipBox.height).toBeLessThanOrEqual(btnBox.y + 2);
      }
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });

  test('data-tooltip 声明式', async ({ page }) => {
    await openPlayground(page);
    const box = page.locator('ffbox-tooltip .tooltip-box');

    await test.step('悬停后气泡显示且文案正确', async () => {
      await page.locator('#tooltipAutoscanBtn').hover();
      await softExpect(box).not.toHaveClass(/hidden/);
      await softExpect(page.locator('ffbox-tooltip .tooltip-message')).toContainText('data-tooltip 声明式');
    });

    await test.step('使用 large 样式', async () => {
      await softExpect(box).not.toHaveClass(/small/);
    });

    await test.step('移开鼠标后气泡隐藏', async () => {
      await page.mouse.move(0, 0);
      await softExpect(box).toHaveClass(/hidden/);
    });
  });
});

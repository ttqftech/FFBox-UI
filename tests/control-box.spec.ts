import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-control-box', () => {
  test('内容与交互', async ({ page }) => {
    await openPlayground(page);

    await test.step('渲染控制盒与标题', async () => {
      const cb1 = page.locator('#ctrlbox1');
      await softExpect(cb1).toBeVisible();
      await softExpect(cb1.locator('.controlBox-title')).toHaveText('普通');
    });

    await test.step('非 optional 不渲染复选框', async () => {
      await softExpect(page.locator('#ctrlbox1 ffbox-checkbox')).toHaveCount(0);
    });

    await test.step('optional 渲染复选框且 has-value 时为选中态', async () => {
      const optionalCheckbox = page.locator('#ctrlbox2 ffbox-checkbox');
      await softExpect(optionalCheckbox).toHaveCount(1);
      await softExpect(optionalCheckbox).toHaveAttribute('checked', '');
    });

    await test.step('点击 optional 复选框触发 enabled-change', async () => {
      await page.locator('#ctrlbox2 ffbox-checkbox').click();
      await softExpect(page.locator('#controlbox-log')).toContainText('ControlBox enabled → false');
    });

    await test.step('long 变体渲染且标题正确', async () => {
      const cb3 = page.locator('#ctrlbox3');
      await softExpect(cb3).toBeVisible();
      await softExpect(cb3.locator('.controlBox-title')).toHaveText('长选项');
    });

    await test.step('description 写入 title 属性', async () => {
      await softExpect(page.locator('#ctrlbox2 .controlBox-title')).toHaveAttribute('title', '带开关');
    });
  });

  test('布局', async ({ page }) => {
    await openPlayground(page);

    await test.step('非 optional、非 long：宽 210px，右边距 28px', async () => {
      await softExpect(page.locator('#ctrlbox1')).toHaveCSS('width', '210px');
      await softExpect(page.locator('#ctrlbox1')).toHaveCSS('margin-right', '28px');
    });

    await test.step('optional、非 long、has-value：宽 210px，右边距 20px', async () => {
      await softExpect(page.locator('#ctrlbox2')).toHaveCSS('width', '210px');
      await softExpect(page.locator('#ctrlbox2')).toHaveCSS('margin-right', '20px');
    });

    await test.step('long、非 optional：宽度铺满（>210px），右边距 20px', async () => {
      const cb3Width = await page.locator('#ctrlbox3').evaluate(el => getComputedStyle(el).width);
      softExpect(Number(cb3Width.replace('px', ''))).toBeGreaterThan(210);
      await softExpect(page.locator('#ctrlbox3')).toHaveCSS('margin-right', '20px');
    });
  });
});

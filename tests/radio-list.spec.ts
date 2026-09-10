import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-radio-list', () => {
  test('选择', async ({ page }) => {
    await openPlayground(page);
    const rl = page.locator('#rl1');
    const items = rl.locator('.item');

    await test.step('渲染 7 项', async () => {
      await softExpect(items).toHaveCount(7);
    });

    await test.step('空值项显示 placeholder 并带空样式', async () => {
      const emptyItem = items.nth(6);
      await softExpect(emptyItem.locator('.itemLabel')).toHaveText('空白项 placeholder');
      await softExpect(emptyItem.locator('.itemLabel')).toHaveClass(/itemLabelEmpty/);
    });

    await test.step('点击选中第 0 项', async () => {
      await items.nth(0).click();
      await softExpect(rl.locator('.itemSelected .itemLabel')).toHaveText('普通 1（自定义 caption）');
    });

    await test.step('点击切换选中到第 1 项', async () => {
      await items.nth(1).click();
      await softExpect(rl.locator('.itemSelected .itemLabel')).toHaveText('普通 2');
    });

    await test.step('选中事件写入日志', async () => {
      await items.nth(2).click();
      await softExpect(page.locator('#radiolist-log')).toContainText('RadioList → 可删除 (index 2)');
    });
  });

  test('删除', async ({ page }) => {
    await openPlayground(page);
    const items = page.locator('#rl1 .item');

    await test.step('仅 deletable 项渲染删除按钮', async () => {
      await softExpect(items.nth(0).locator('.itemDelete')).toHaveCount(0);
      await softExpect(items.nth(2).locator('.itemDelete svg')).toHaveCount(1);
    });

    await test.step('点击删除触发事件', async () => {
      await items.nth(2).locator('.itemDelete').click();
      await softExpect(page.locator('#radiolist-log')).toContainText('RadioList delete → 可删除');
    });
  });

  test('编辑', async ({ page }) => {
    await openPlayground(page);
    const item = page.locator('#rl1 .item').nth(3);

    await test.step('选中后点击 label 进入编辑态', async () => {
      await item.click();
      await item.locator('.itemLabel').click();
      await softExpect(item.locator('ffbox-input-auto-size input')).toBeVisible();
    });

    await test.step('全选改写后回车确认', async () => {
      const input = item.locator('ffbox-input-auto-size input');
      await input.click({ clickCount: 3 });
      await page.keyboard.type('edited');
      await page.keyboard.press('Enter');

      await softExpect(page.locator('#radiolist-log')).toContainText('RadioList edit → "可编辑" → "edited"');
      await softExpect(item.locator('ffbox-input-auto-size')).toHaveCount(0);
    });
  });

  test('禁用', async ({ page }) => {
    await openPlayground(page);

    await test.step('禁用项带 itemDisabled 类且不响应指针事件', async () => {
      const item = page.locator('#rl1 .item').nth(5);
      await softExpect(item).toHaveClass(/itemDisabled/);
      await softExpect(item).toHaveCSS('pointer-events', 'none');
    });
  });
});

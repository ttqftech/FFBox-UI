import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

async function waitForMsgboxReady(page: import('@playwright/test').Page) {
  await expect(page.locator('ffbox-msgbox .box.entered')).toBeVisible();
}

test.describe('ffbox-msgbox', () => {
  test('单按钮下 Esc 直接触发该按钮', async ({ page }) => {
    await openPlayground(page);

    await test.step('打开单按钮弹窗，标题与内容正确', async () => {
      await page.locator('#msgboxSingle').click();
      const msgbox = page.locator('ffbox-msgbox');
      await softExpect(msgbox).toBeVisible();
      await softExpect(msgbox.locator('.title')).toHaveText('提示');
      await softExpect(msgbox.locator('.content')).toContainText('只有一个按钮的对话框');
    });

    await test.step('Esc 直接命中唯一按钮并关闭弹窗', async () => {
      await waitForMsgboxReady(page);
      await page.keyboard.press('Escape');
      await softExpect(page.locator('#msgbox-log')).toContainText('Msgbox 单按钮 → 确定');
      await softExpect(page.locator('ffbox-msgbox')).toHaveCount(0);
    });
  });

  test('点击按钮关闭', async ({ page }) => {
    await openPlayground(page);

    await test.step('点击确定按钮写日志', async () => {
      await page.locator('#msgboxConfirm').click();
      const msgbox = page.locator('ffbox-msgbox');
      await softExpect(msgbox).toBeVisible();
      await msgbox.locator('ffbox-button', { hasText: '确定' }).click();
      await softExpect(page.locator('#msgbox-log')).toContainText('Msgbox → 确定');
    });

    // 离场动画结束后自动从 DOM 移除
    await test.step('离场动画结束后弹窗从 DOM 移除', async () => {
      await softExpect(page.locator('ffbox-msgbox')).toHaveCount(0);
    });
  });

  test('键盘 Esc / Enter 命中 role', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#msgbox-log');

    await test.step('Esc → 取消', async () => {
      await page.locator('#msgboxConfirm').click();
      await waitForMsgboxReady(page);
      await page.keyboard.press('Escape');
      await softExpect(log).toContainText('Msgbox → 取消');
      await softExpect(page.locator('ffbox-msgbox')).toHaveCount(0);
    });

    await test.step('Enter → 确定', async () => {
      await page.locator('#msgboxConfirm').click();
      await waitForMsgboxReady(page);
      await page.keyboard.press('Enter');
      await softExpect(log).toContainText('Msgbox → 确定');
      await softExpect(page.locator('ffbox-msgbox')).toHaveCount(0);
    });
  });

  test('异步回调完成后关闭', async ({ page }) => {
    await openPlayground(page);

    const msgbox = page.locator('ffbox-msgbox');
    await page.locator('#msgboxAsync').click();
    const deleteBtn = msgbox.locator('ffbox-button', { hasText: '删除' });

    await test.step('异步弹窗显示图标', async () => {
      await softExpect(msgbox).toBeVisible();
      await softExpect(msgbox.locator('.image svg')).toHaveCount(1);
    });

    await test.step('Promise 未 resolve 前弹窗保留且按钮禁用', async () => {
      await deleteBtn.click();
      await softExpect(msgbox).toHaveCount(1);
      await softExpect(deleteBtn).toHaveAttribute('disabled', '');
    });

    await test.step('回调完成后弹窗关闭', async () => {
      await softExpect(page.locator('#msgbox-log')).toContainText('Msgbox 异步回调完成');
      await softExpect(msgbox).toHaveCount(0);
    });
  });

  test('遮罩按下时弹窗回弹', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#msgboxConfirm').click();
    const box = page.locator('ffbox-msgbox .box');
    await softExpect(box).toBeVisible();

    // 取左上角坐标按下，避开居中的 box
    await test.step('遮罩 mousedown 时盒子缩小', async () => {
      await page.mouse.move(4, 4);
      await page.mouse.down();
      await softExpect(box).toHaveCSS('transform', /matrix\(0\.9/);
    });

    await test.step('mouseup 后盒子还原', async () => {
      await page.mouse.up();
      await softExpect(box).toHaveCSS('transform', /matrix\(1,\s*0,\s*0,\s*1/);
    });
  });

  test('不传 buttons 时使用默认按钮', async ({ page }) => {
    await openPlayground(page);

    await test.step('默认只渲染一个「好嘅」按钮', async () => {
      await page.evaluate(async () => {
        const { FFBoxMsgbox } = await import('/src/ffbox-ui.js');
        FFBoxMsgbox.show({ title: '默认按钮', content: '只有一个好嘅' });
      });
      const buttons = page.locator('ffbox-msgbox ffbox-button');
      await softExpect(buttons).toHaveCount(1);
      await softExpect(buttons).toHaveText('好嘅');
    });

    await test.step('点击后弹窗关闭', async () => {
      await page.locator('ffbox-msgbox ffbox-button').click();
      await softExpect(page.locator('ffbox-msgbox')).toHaveCount(0);
    });
  });

  test('同时打开两个弹窗，关闭上层后焦点回到下层', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#msgbox-log');
    const msgboxes = page.locator('ffbox-msgbox');

    await test.step('打开两个堆叠弹窗', async () => {
      await page.locator('#msgboxStack').click();
      await softExpect(msgboxes).toHaveCount(2);
      await softExpect(msgboxes.last().locator('.box.entered')).toBeVisible();
    });

    await test.step('Enter 关闭上层弹窗（role=confirm）', async () => {
      await page.keyboard.press('Enter');
      await softExpect(log).toContainText('上层弹窗 → 确定');
      await softExpect(msgboxes).toHaveCount(1);
    });

    await test.step('焦点回到底层，Enter 关闭底层弹窗', async () => {
      await page.keyboard.press('Enter');
      await softExpect(log).toContainText('底层弹窗 → 确定');
      await softExpect(msgboxes).toHaveCount(0);
    });
  });
});

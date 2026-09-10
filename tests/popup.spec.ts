import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-popup', () => {
  test('弹出与内容', async ({ page }) => {
    await openPlayground(page);

    await test.step('普通气泡弹出并显示文案', async () => {
      await page.locator('#popupNormal').click();
      const popup = page.locator('ffbox-popup');
      await softExpect(popup).toBeVisible();
      await softExpect(popup.locator('.popup-message')).toContainText('这是一条普通气泡通知');
    });

    // 多行消息渲染为 <br>
    await test.step('多行消息渲染为换行', async () => {
      await softExpect(page.locator('ffbox-popup .popup-message br')).toHaveCount(1);
    });
  });

  test('等级样式', async ({ page }) => {
    await openPlayground(page);

    await test.step('默认（白）不带等级类', async () => {
      await page.locator('#popupNormal').click();
      await softExpect(page.locator('ffbox-popup .popup-box')).not.toHaveClass(/popup-(ok|warning|error)/);
    });

    await test.step('绿 / 黄 / 红 各自带对应类', async () => {
      await page.locator('#popupOk').click();
      await softExpect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-ok/);
      await page.locator('#popupWarning').click();
      await softExpect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-warning/);
      await page.locator('#popupError').click();
      await softExpect(page.locator('ffbox-popup').last().locator('.popup-box')).toHaveClass(/popup-error/);
    });
  });

  test('多条堆叠', async ({ page }) => {
    await openPlayground(page);

    await test.step('同时存在两条气泡', async () => {
      await page.locator('#popupNormal').click();
      await page.locator('#popupOk').click();
      await softExpect(page.locator('ffbox-popup')).toHaveCount(2);
    });

    // 最新的一条在最下方（translateY(0)），较早的一条被上推
    await test.step('最新一条在下方，较早一条被上推', async () => {
      await page.waitForTimeout(100);
      const translateY = (index: number) => page.locator('ffbox-popup').nth(index).evaluate(el => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return m.m42;
      });
      softExpect(await translateY(1)).toBe(0);
      softExpect(await translateY(0)).toBeLessThan(0);
    });
  });

  test('点击关闭按钮消失', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#popupNormal').click();
    const popup = page.locator('ffbox-popup');
    const box = popup.locator('.popup-box');
    const closeBtn = popup.locator('.popup-progress-x');

    await test.step('弹窗可见', async () => {
      await softExpect(popup).toBeVisible();
    });

    await test.step('悬停后进度环隐藏、关闭按钮显现', async () => {
      await box.hover();
      await softExpect(closeBtn).toHaveCSS('opacity', '1');
    });

    await test.step('点击关闭后移除', async () => {
      await closeBtn.click();
      await softExpect(popup).toHaveCount(0);
    });
  });

  test('鼠标悬停暂停倒计时', async ({ page }) => {
    await openPlayground(page);

    await test.step('弹出气泡并悬停', async () => {
      await page.evaluate(async () => {
        const { FFBoxPopup } = await import('/src/ffbox-ui.js');
        FFBoxPopup.show({ message: 'hover' });
      });
      const popup = page.locator('ffbox-popup');
      await softExpect(popup).toBeVisible();
      await popup.locator('.popup-box').hover();
    });

    // 悬停时 timeLeft 被回补，进度环不再推进（甚至回退）
    await test.step('进度环不再推进', async () => {
      const popup = page.locator('ffbox-popup');
      const circle = popup.locator('.popup-progress-circle circle');
      const offset1 = await circle.getAttribute('stroke-dashoffset');
      await page.waitForTimeout(1200);
      const offset2 = await circle.getAttribute('stroke-dashoffset');
      softExpect(Number(offset2)).toBeGreaterThanOrEqual(Number(offset1));
      await softExpect(popup).toHaveCount(1);
    });
  });

  test('倒计时结束自动关闭', async ({ page }) => {
    await openPlayground(page);

    await test.step('气泡出现', async () => {
      await page.evaluate(async () => {
        const { FFBoxPopup } = await import('/src/ffbox-ui.js');
        FFBoxPopup.show({ message: 'x' });	// 2500 + 1 * 100 = 2600ms
      });
      await softExpect(page.locator('ffbox-popup')).toBeVisible();
    });

    await test.step('倒计时结束后自动移除', async () => {
      await softExpect(page.locator('ffbox-popup')).toHaveCount(0, { timeout: 8000 });
    });
  });

  test('一次性弹出 40 条时上限为 30', async ({ page }) => {
    await openPlayground(page);

    await test.step('批量弹出后最多保留 30 条', async () => {
      await page.evaluate(async () => {
        const { FFBoxPopup } = await import('/src/ffbox-ui.js');
        for (let i = 0; i < 40; i++) {
          FFBoxPopup.show({ message: `批量气泡 #${i + 1}`, level: (i % 4) as 0 | 1 | 2 | 3 });
        }
      });
      await softExpect(page.locator('ffbox-popup')).toHaveCount(30, { timeout: 5000 });
    });

    await test.step('保留下来的气泡文案非空', async () => {
      const messages = page.locator('ffbox-popup .popup-message');
      softExpect(await messages.first().textContent()).toBeTruthy();
      softExpect(await messages.last().textContent()).toBeTruthy();
    });
  });
});

import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

async function waitForProp(page: import('@playwright/test').Page, id: string, prop: string) {
  await page.locator(id).evaluate((el, prop) => {
    return new Promise<void>(resolve => {
      if ((el as any)[prop]?.length ?? (el as any)[prop]) { resolve(); return; }
      const check = () => { ((el as any)[prop]?.length ?? (el as any)[prop]) ? resolve() : requestAnimationFrame(check); };
      requestAnimationFrame(check);
    });
  }, prop);
}

test.describe('ffbox-slider', () => {
  test('数值吸附、键盘操作与字符串模式', async ({ page }) => {
    await openPlayground(page);
    const log = page.locator('#slider-log');

    const sliderA = page.locator('#sliderA');
    const slipperA = sliderA.locator('.slider-module-slipper');

    await test.step('滑块 A：初值 0.5 且滑块渲染', async () => {
      await softExpect(sliderA).toBeVisible();
      await softExpect(slipperA).toBeVisible();
      await softExpect(page.locator('#sliderA-value')).toContainText('0.5');
    });

    await test.step('滑块 A：value 按数字解析，滑块位于 50%', async () => {
      const moduleBox = await sliderA.locator('.slider-module').boundingBox();
      const slipperBox = await slipperA.boundingBox();
      expect(moduleBox).not.toBeNull();
      expect(slipperBox).not.toBeNull();
      const relativePos = ((slipperBox!.x + slipperBox!.width / 2) - moduleBox!.x) / moduleBox!.width;
      softExpect(relativePos).toBeCloseTo(0.5, 1);
    });

    await test.step('滑块 A：点击轨道更新值', async () => {
      await sliderA.locator('.slider-module').click({ position: { x: 200, y: 28 } });
      await softExpect(log).toContainText('Slider A →');
    });

    const sliderB = page.locator('#sliderB');
    const slipperB = sliderB.locator('.slider-module-slipper');

    await test.step('滑块 B：整数吸附，方向键增减', async () => {
      await softExpect(page.locator('#sliderB-value')).toContainText('5');
      await slipperB.focus();
      await slipperB.press('ArrowRight');
      await softExpect(log).toContainText('Slider B → 6');
      await slipperB.press('ArrowLeft');
      await softExpect(log).toContainText('Slider B → 5');
    });

    await test.step('滑块 B：点击轨道吸附到整数', async () => {
      await sliderB.locator('.slider-module').click({ position: { x: 150, y: 28 } });
      await page.waitForTimeout(200);
      const match = (await log.textContent())?.match(/Slider B → (\d+)/);
      softExpect(match).not.toBeNull();
      softExpect(Number.isInteger(Number(match?.[1]))).toBe(true);
    });

    const sliderC = page.locator('#sliderC');

    await test.step('滑块 C：字符串模式渲染 5 个刻度', async () => {
      await waitForProp(page, '#sliderC', 'tags');
      const marks = sliderC.locator('.slider-module-mark');
      await softExpect(marks).toHaveCount(5);
      await softExpect(marks.nth(0)).toContainText('低');
      await softExpect(marks.nth(4)).toContainText('无损');
    });

    await test.step('滑块 C：显示标签而非数字，滑块位于 25%', async () => {
      await softExpect(sliderC.locator('.slider-text')).toContainText('中');

      const slipperC = sliderC.locator('.slider-module-slipper');
      const moduleBox = await sliderC.locator('.slider-module').boundingBox();
      const slipperBox = await slipperC.boundingBox();
      expect(moduleBox).not.toBeNull();
      expect(slipperBox).not.toBeNull();
      const relativePos = ((slipperBox!.x + slipperBox!.width / 2) - moduleBox!.x) / moduleBox!.width;
      softExpect(relativePos).toBeCloseTo(0.25, 1);
    });

    await test.step('滑块 C：方向键输出标签值', async () => {
      await sliderC.locator('.slider-module-slipper').focus();
      await sliderC.locator('.slider-module-slipper').press('ArrowRight');
      await page.waitForTimeout(200);
      const logText = await log.textContent();
      softExpect(logText).toContain('Slider C →');
      softExpect(logText).toMatch(/Slider C → (高|极高)/);
    });

    await test.step('滑块 D：整数 + tags 吸附渲染刻度与文本', async () => {
      await waitForProp(page, '#sliderD', 'tags');
      const marks = page.locator('#sliderD .slider-module-mark');
      await softExpect(marks).toHaveCount(5);
      await softExpect(marks.nth(0)).toContainText('0');
      await softExpect(marks.nth(4)).toContainText('100');
      await softExpect(page.locator('#sliderD .slider-text')).toContainText('50');
    });

    await test.step('滑块 E：valueToDisplay 返回对象（带 Kbps 单位）', async () => {
      await waitForProp(page, '#sliderE', 'valueToDisplay');
      await page.waitForTimeout(100);
      await softExpect(page.locator('#sliderE .slider-text')).toContainText('Kbps');
    });
  });
});

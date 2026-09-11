import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-dropdown-input', () => {
  test('初始值与输入', async ({ page }) => {
    await openPlayground(page);

    const dd1 = page.locator('#dd1');

    await test.step('text 属性同步到内部输入框', async () => {
      await softExpect(dd1.locator('input')).toHaveValue('1080p');
    });

    await test.step('手动输入触发 change 事件', async () => {
      await dd1.locator('input').fill('480p');
      await softExpect(page.locator('#dropdown-log')).toContainText('DropdownInput → "480p"');
    });
  });

  test('点击展开下拉菜单并选择', async ({ page }) => {
    await openPlayground(page);

    const dd1 = page.locator('#dd1');

    await test.step('点击后 FFBoxMenu 弹出且当前值高亮', async () => {
      await dd1.locator('.combobox-selector').click();
      const menu = page.locator('ffbox-menu');
      await softExpect(menu).toBeVisible();
      await softExpect(menu.locator('.menuItemSelected .label')).toContainText('1080p');
    });

    await test.step('点击选项后回填文本并派发 change', async () => {
      await page.locator('ffbox-menu .menuItem', { hasText: '跟随源' }).click();
      // onSelect 返回的是 menuItem 的 value（'source'），而非 label
      await softExpect(dd1.locator('input')).toHaveValue('source');
      await softExpect(page.locator('#dropdown-log')).toContainText('DropdownInput → "source"');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('Enter 键打开菜单并可通过方向键选择', async ({ page }) => {
    await openPlayground(page);

    const dd1 = page.locator('#dd1');

    await test.step('未打开菜单时按 Enter 打开菜单', async () => {
      // 注意：点击 selector 会直接打开菜单，这里用 focus 仅聚焦
      await dd1.locator('input').focus();
      await page.keyboard.press('Enter');
      await softExpect(page.locator('ffbox-menu')).toBeVisible();
    });

    await test.step('↓ 选择到 720p（select 模式实时触发 change）', async () => {
      // 菜单打开后选中项的对焦在 setTimeout(0) 中进行（与原版一致），对焦后经 returnFocus
      // 焦点归还输入框，由输入框继续转发按键；此处等两帧确保该初始化链完成后再按键
      await page.waitForFunction(() => new Promise(request => requestAnimationFrame(() => requestAnimationFrame(request))));
      // 初始焦点在选中项 1080p 上，↓ 移动到 720p
      await page.keyboard.press('ArrowDown');
      await softExpect(page.locator('#dropdown-log')).toContainText('DropdownInput → "720p"');
      await softExpect(dd1.locator('input')).toHaveValue('720p');
    });

    await test.step('Enter 确认关闭菜单', async () => {
      await page.keyboard.press('Enter');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
      await softExpect(dd1.locator('input')).toHaveValue('720p');
    });
  });

  test('只读与禁用状态', async ({ page }) => {
    await openPlayground(page);

    await test.step('readonly 可以下拉选择但不允许输入', async () => {
      const dd2 = page.locator('#dd2');
      await softExpect(dd2.locator('input')).toHaveValue('快速');
      await softExpect(dd2.locator('input')).toHaveAttribute('readonly', /.*/);
      await dd2.locator('.combobox-selector').click();
      await softExpect(page.locator('ffbox-menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });

    await test.step('disabled 点击不弹出菜单', async () => {
      const dd3 = page.locator('#dd3');
      await softExpect(dd3).toHaveAttribute('disabled', /.*/);
      await dd3.locator('.combobox-selector').click({ force: true });
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('多级子菜单的深层选中项自动定位与键盘导航', async ({ page }) => {
    await openPlayground(page);

    const dd6 = page.locator('#dd6');

    await test.step('通过组件 API 设定当前选中值为第三层的 AV1（不依赖 playground 默认值）', async () => {
      // 组件的契约是：无论当前选中值在哪里，打开菜单都应从该值继续（对应 Vue watch(currentHoveredItem) 行为）
      await page.evaluate(() => { document.getElementById('dd6').text = 'AV1'; });
      await softExpect(dd6.locator('input')).toHaveValue('AV1');
    });

    await test.step('打开菜单后沿选中项路径展开全部子菜单并高亮第三层项', async () => {
      await dd6.locator('.combobox-selector').click();
      const menu = page.locator('ffbox-menu');
      await softExpect(menu).toBeVisible();
      await softExpect(menu.locator('.menu')).toHaveCount(3);
      await softExpect(menu.locator('.menuItemSelected .label')).toContainText('AV1');
    });

    await test.step('子菜单逐级向右弹出，不与第一个菜单堆叠', async () => {
      // 回归：Lit @state 原地 mutation 不触发重渲染时，所有子菜单会停留在 triggerRect
      // 回退位置上（与第一个菜单完全重叠）。此处等待位置计算（含逐级 updateComplete）完成后断言横向错开
      await page.waitForFunction(() => {
        const root = document.querySelector('ffbox-menu')?.shadowRoot;
        if (!root) return false;
        const menus = [...root.querySelectorAll('.menu')].map((m) => m.getBoundingClientRect());
        return menus.length === 3 && menus.slice(1).every((r) => r.left - menus[0].left > 50);
      }, undefined, { timeout: 5000 });
    });

    await test.step('↑↓ 在第三层子菜单内导航（AV1 → VP9）', async () => {
      // 初始焦点在选中项 AV1 上，↓ 移动到 VP9（select 模式实时触发 change）
      await page.keyboard.press('ArrowDown');
      await softExpect(page.locator('#dropdown-log')).toContainText('DropdownInput → "VP9"');
      await softExpect(dd6.locator('input')).toHaveValue('VP9');
    });

    await test.step('Enter 确认关闭菜单', async () => {
      await page.keyboard.press('Enter');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
      await softExpect(dd6.locator('input')).toHaveValue('VP9');
    });

    await test.step('重新打开菜单应从当前选中项（VP9）继续，而非回到初始 text 值', async () => {
      // 回归：原版由父组件在 onChange 中写回 :text（受控用法），Web Component 为自包含组件，
      // 须在选中时将值同步回 text 属性，否则重开菜单永远定位到初始值
      await dd6.locator('.combobox-selector').click();
      await softExpect(page.locator('ffbox-menu')).toBeVisible();
      await softExpect(page.locator('ffbox-menu .menuItemSelected .label')).toContainText('VP9');
      await page.keyboard.press('Escape');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('校验非法输入时背景转红', async ({ page }) => {
    await openPlayground(page);

    const dd4 = page.locator('#dd4');

    await test.step('输入非整数后进入 invalid 状态', async () => {
      await dd4.locator('input').fill('abc');
      await softExpect(dd4.locator('.combobox-selector')).toHaveClass(/invalid/);
    });

    await test.step('改回合法值后恢复', async () => {
      await dd4.locator('input').fill('2048');
      await softExpect(dd4.locator('.combobox-selector')).not.toHaveClass(/invalid/);
    });
  });
});

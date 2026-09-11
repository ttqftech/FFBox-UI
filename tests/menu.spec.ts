import { test, expect } from '@playwright/test';
import { openPlayground } from './utils';

// 软断言：单个测试项失败不会中断后续步骤，一次跑完所有测试项
const softExpect = expect.configure({ soft: true });

test.describe('ffbox-menu', () => {
  test('动作菜单弹出、选择与关闭', async ({ page }) => {
    await openPlayground(page);

    await test.step('弹出动作菜单并渲染所有菜单项', async () => {
      await page.locator('#menuAction').click();
      const menu = page.locator('ffbox-menu');
      await softExpect(menu).toBeVisible();
      // 只有顶层菜单被打开（子菜单未 hover 时不渲染）
      await softExpect(menu.locator('.menu')).toHaveCount(1);
      await softExpect(menu.locator('.menuItem', { hasText: '打开文件…' })).toBeVisible();
      await softExpect(menu.locator('.menuItem', { hasText: '分享到…' })).toBeVisible();
    });

    await test.step('禁用项带 menuItemDisabled 类', async () => {
      const disabledItem = page.locator('ffbox-menu .menuItemDisabled');
      await softExpect(disabledItem).toHaveCount(1);
      await softExpect(disabledItem.locator('.label')).toContainText('重命名');
    });

    await test.step('分隔符渲染为 menuSeparator', async () => {
      await softExpect(page.locator('ffbox-menu .menuSeparator')).toHaveCount(1);
    });

    await test.step('点击菜单项触发 onSelect 并自动关闭', async () => {
      await page.locator('ffbox-menu .menuItem', { hasText: '保存项目' }).click();
      await softExpect(page.locator('#menu-log')).toContainText('Menu 动作 → save');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('点击遮罩关闭菜单', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#menuAction').click();
    await softExpect(page.locator('ffbox-menu')).toBeVisible();

    await test.step('点击菜单外区域关闭（离场动画后移除）', async () => {
      // 点到遮罩上（菜单以外、屏幕下方空白处），不落在菜单项上
      await page.mouse.click(10, 600);
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('Esc 键关闭菜单', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#menuAction').click();
    await softExpect(page.locator('ffbox-menu')).toBeVisible();

    await test.step('按下 Esc 后关闭', async () => {
      await page.keyboard.press('Escape');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('选项菜单的选中与键盘操作', async ({ page }) => {
    await openPlayground(page);

    await test.step('弹出选项菜单并高亮选中项', async () => {
      await page.locator('#menuSelect').click();
      const menu = page.locator('ffbox-menu');
      await softExpect(menu).toBeVisible();
      await softExpect(menu.locator('.menuItemSelected .label')).toContainText('720p');
      // 选中项的对焦在 setTimeout(0) 中进行（与原版一致），需等待其完成再按键
      await expect(menu.locator('.menuItemSelected')).toBeFocused();
    });

    await test.step('↑↓ 移动焦点时实时触发 onSelect（select 模式）', async () => {
      // 初始焦点在选中项 720p 上，↑ 移动到 1080p
      await page.keyboard.press('ArrowUp');
      await softExpect(page.locator('#menu-log')).toContainText('Menu 选项 → 1080p');
    });

    await test.step('Enter 确认并关闭', async () => {
      await page.keyboard.press('Enter');
      await softExpect(page.locator('ffbox-menu')).toHaveCount(0);
    });
  });

  test('子菜单 hover 展开', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#menuAction').click();
    const menu = page.locator('ffbox-menu');
    await softExpect(menu).toBeVisible();

    await test.step('hover 父项后子菜单出现', async () => {
      await softExpect(menu.locator('.menu')).toHaveCount(1);
      await menu.locator('.menuItem', { hasText: '分享到…' }).hover();
      await softExpect(menu.locator('.menu')).toHaveCount(2);
      await softExpect(menu.locator('.menu >> nth=1').locator('.label')).toContainText(['复制链接', '邮件']);
    });

    await test.step('hover 移开后子菜单收起', async () => {
      await menu.locator('.menuItem', { hasText: '打开文件…' }).hover();
      await softExpect(menu.locator('.menu')).toHaveCount(1);
    });
  });

  test('复选 / 单选菜单项', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#menuCheck').click();
    const menu = page.locator('ffbox-menu');
    await softExpect(menu).toBeVisible();

    await test.step('checkbox 项内嵌 ffbox-checkbox 且初始勾选', async () => {
      const muteItem = menu.locator('.menuItem', { hasText: '静音' });
      await softExpect(muteItem.locator('ffbox-checkbox')).toHaveAttribute('checked', /.*/);
    });

    await test.step('radio 项初始仅一项选中', async () => {
      await softExpect(menu.locator('.menuItem', { hasText: '速度优先' }).locator('ffbox-radio')).toHaveAttribute('checked', /.*/);
      await softExpect(menu.locator('.menuItem', { hasText: '质量优先' }).locator('ffbox-radio')).not.toHaveAttribute('checked');
    });

    await test.step('点击 radio 项触发 onSelect', async () => {
      await menu.locator('.menuItem', { hasText: '质量优先' }).click();
      await softExpect(page.locator('#menu-log')).toContainText('Menu 复选/单选 → quality');
      await softExpect(menu).toHaveCount(0);
    });
  });

  test('tooltip 跟随 hover 显示', async ({ page }) => {
    await openPlayground(page);

    await page.locator('#menuAction').click();
    const menu = page.locator('ffbox-menu');
    await softExpect(menu).toBeVisible();

    await test.step('hover 带 tooltip 的项后显示 ffbox-tooltip', async () => {
      await menu.locator('.menuItem', { hasText: '保存项目' }).hover();
      const tooltip = page.locator('ffbox-tooltip');
      await softExpect(tooltip).toBeVisible();
      await softExpect(tooltip.locator('.tooltip-message')).toContainText('Ctrl+S');
    });
  });
});

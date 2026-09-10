import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // 预热 dev server，避免并发 worker 冷启动时互相拖慢导致随机超时
  globalSetup: './tests/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 本地限制并发：dev server 是单进程按需编译的，worker 越多越容易互相拖垮
  workers: process.env.CI ? 1 : '50%',
  // printSteps：在终端逐行打印 test.step 的名称与结果（也可用环境变量 PLAYWRIGHT_LIST_PRINT_STEPS=1 临时开启）
  reporter: process.env.CI
    ? [['list', { printSteps: true }], ['html']]
    : [['list', { printSteps: true }]],
  timeout: 10000,
  expect: {
    timeout: 3000,
  },
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'off', // 'on-first-retry'
  },
  projects: [
    { name: 'chromium',  use: { ...devices['Desktop Chrome'] }  },
    // CI 时才启用其他浏览器
    ...(process.env.CI ? [
      { name: 'firefox',   use: { ...devices['Desktop Firefox'] }, timeout: 20000 },
      { name: 'webkit',    use: { ...devices['Desktop Safari'] }  },
      { name: 'mob-safari',use: { ...devices['iPhone 15'] }       },
      { name: 'mob-chrome',use: { ...devices['Pixel 7'] }         },
    ] : []),
  ],
  webServer: {
    command: 'npx vite --config vite.config.dev.ts',
    port: 6006,
    reuseExistingServer: true || !process.env.CI,
  },
});

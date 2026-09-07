import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : '100%',
  reporter: process.env.CI ? 'html' : 'list',
  timeout: 15000,
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

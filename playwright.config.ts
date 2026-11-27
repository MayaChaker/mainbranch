import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: baseURL,
    timeout: 180_000,
    env: { AUTH_TRUST_HOST: "true" },
  },
});

import { expect, test } from "@playwright/test";

const PROTECTED_PAGES = [
  "/dashboard",
  "/bookmarks",
  "/settings",
  "/create",
  "/blogs/hello-world/edit",
];

for (const path of PROTECTED_PAGES) {
  test(`signed-out visit to ${path} goes to sign-in`, async ({ page }) => {
    await page.goto(path);

    await expect(page).toHaveURL(
      `/signin?callbackUrl=${encodeURIComponent(path)}`,
    );
  });
}

test("the query string is kept in callbackUrl", async ({ page }) => {
  await page.goto("/settings?tab=profile");

  await expect(page).toHaveURL(
    `/signin?callbackUrl=${encodeURIComponent("/settings?tab=profile")}`,
  );
});

test("public pages do not redirect", async ({ page }) => {
  for (const path of ["/", "/signin"]) {
    await page.goto(path);
    await expect(page).toHaveURL(path);
  }
});

import { expect, test } from "@playwright/test";

test("sign-in page shows both providers", async ({ page }, testInfo) => {
  await page.goto("/signin");

  await expect(
    page.getByRole("heading", { level: 1, name: "Pick up where you branched off." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);

  await page.screenshot({
    path: testInfo.outputPath("signin.png"),
    fullPage: true,
  });
});

test("sign-in page explains an account that is not linked", async ({
  page,
}, testInfo) => {
  await page.goto("/signin?error=OAuthAccountNotLinked");

  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "already used with another sign-in method",
  );

  await page.screenshot({
    path: testInfo.outputPath("signin-error.png"),
    fullPage: true,
  });
});

test("an unknown error shows a general message", async ({ page }) => {
  await page.goto("/signin?error=SomethingElse");

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Sign-in failed. Please try again.",
  );
});

test("the navbar Sign in link opens the sign-in page", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "the desktop navbar link is hidden on mobile");
  await page.goto("/");

  await page.getByRole("link", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL("/signin");
});

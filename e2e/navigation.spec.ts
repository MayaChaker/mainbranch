import { expect, test } from "@playwright/test";

test("mobile menu opens and closes after a link click", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "the menu exists only on mobile");
  await page.goto("/");

  const signIn = page.getByRole("link", { name: "Sign in" });
  await expect(signIn).toBeHidden();

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(signIn).toBeVisible();

  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(signIn).toBeHidden();
});

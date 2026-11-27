import { expect, test } from "@playwright/test";
import { signInAsTestUser } from "./support/auth";

test("lists the communities and finds one by search", async ({ page }) => {
  await page.goto("/communities");
  await expect(page.getByRole("heading", { level: 2, name: "React" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Python" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search communities" }).fill("python");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL("/communities?search=python");
  await expect(
    page.getByText("1 result for “python”").filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Python" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "React" })).toHaveCount(0);
});

test("shows a friendly message when nothing matches", async ({ page }) => {
  await page.goto("/communities?search=zzz");
  await expect(page.getByText("No communities found")).toBeVisible();
});

test("an unknown community shows the not-found page", async ({ page }) => {
  const response = await page.goto("/communities/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This community does not exist")).toBeVisible();
});

test("a signed-out visitor is sent to sign in and back", async ({ page }) => {
  await page.goto("/communities/python");

  await page.getByRole("link", { name: "Sign in to join" }).click();

  await expect(page).toHaveURL(
    `/signin?callbackUrl=${encodeURIComponent("/communities/python")}`,
  );
});

test("a signed-in developer joins and leaves a community", async ({
  page,
  context,
}, testInfo) => {
  // Desktop and mobile share one database, so each project uses its own community.
  const slug = testInfo.project.name === "mobile" ? "mobile" : "devops";
  await signInAsTestUser(context);
  await page.goto(`/communities/${slug}`);

  await page.getByRole("button", { name: /^Join / }).click();
  await expect(page.getByText("You are a member.")).toBeVisible();
  await expect(page.getByText("1 member", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^Leave / }).click();
  await expect(page.getByRole("button", { name: /^Join / })).toBeVisible();
  await expect(page.getByText("0 members", { exact: true })).toBeVisible();

  // After a reload the server agrees: the cached page was refreshed.
  await page.reload();
  await expect(page.getByText("0 members", { exact: true })).toBeVisible();
});

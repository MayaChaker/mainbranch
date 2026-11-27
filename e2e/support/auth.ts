import type { BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { E2E_AUTH_SECRET, E2E_USER } from "./constants";

const COOKIE_NAME = "authjs.session-token";

// Signs the browser in as the seeded test user by writing the same JWT
// cookie Auth.js would write after a real GitHub or Google sign-in.
export async function signInAsTestUser(context: BrowserContext) {
  const token = await encode({
    secret: E2E_AUTH_SECRET,
    salt: COOKIE_NAME,
    token: {
      sub: E2E_USER.id,
      name: E2E_USER.name,
      email: E2E_USER.email,
      username: E2E_USER.username,
    },
  });

  await context.addCookies([
    {
      name: COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

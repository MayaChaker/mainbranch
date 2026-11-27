"use server";

import { signIn } from "@/auth";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

const PROVIDERS = ["github", "google"] as const;
export type Provider = (typeof PROVIDERS)[number];

export async function signInWith(provider: Provider, callbackUrl: string) {
  if (!PROVIDERS.includes(provider)) {
    throw new Error("Unknown sign-in provider.");
  }
  await signIn(provider, { redirectTo: safeCallbackUrl(callbackUrl) });
}

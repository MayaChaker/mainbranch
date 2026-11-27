"use client";

import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { safeCallbackUrl } from "@/lib/safe-callback-url";
import { signInWith, type Provider } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already used with another sign-in method. Sign in with the provider you used first.",
  AccessDenied: "Sign-in was cancelled. You can try again.",
};
const DEFAULT_ERROR = "Sign-in failed. Please try again.";

const PROVIDERS: { id: Provider; name: string }[] = [
  { id: "github", name: "GitHub" },
  { id: "google", name: "Google" },
];

function ProviderButton({ index, name }: { index: number; name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={`Continue with ${name}`}
      className="group flex w-full items-baseline gap-6 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait"
    >
      <span className="font-mono text-xs text-text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-display text-2xl text-text transition-colors group-hover:text-accent-text">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="ml-auto font-mono text-sm text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-text"
      >
        {pending ? "redirecting…" : "→"}
      </span>
    </button>
  );
}

export function SignInPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
        Continue with
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 border-l-2 border-error-bg pl-3 text-sm text-error-text"
        >
          {ERROR_MESSAGES[error] ?? DEFAULT_ERROR}
        </p>
      )}

      <ul className="mt-4 border-t border-border">
        {PROVIDERS.map((provider, index) => (
          <li key={provider.id} className="border-b border-border">
            <form action={signInWith.bind(null, provider.id, callbackUrl)}>
              <ProviderButton index={index} name={provider.name} />
            </form>
          </li>
        ))}
      </ul>

      <p className="mt-6 font-mono text-xs leading-relaxed text-text-muted">
        We only receive your name, email and profile picture.
      </p>
    </div>
  );
}

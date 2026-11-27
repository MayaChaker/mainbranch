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

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

const PROVIDERS: { id: Provider; name: string; Icon: () => React.JSX.Element; className: string }[] = [
  {
    id: "github",
    name: "GitHub",
    Icon: GitHubIcon,
    className: "bg-accent text-on-accent hover:bg-accent-hover",
  },
  {
    id: "google",
    name: "Google",
    Icon: GoogleIcon,
    className: "border border-border bg-surface text-text hover:border-accent",
  },
];

function ProviderButton({ provider }: { provider: (typeof PROVIDERS)[number] }) {
  const { pending } = useFormStatus();
  const { Icon } = provider;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`flex w-full items-center justify-center gap-3 rounded-control px-5 py-3.5 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-wait disabled:opacity-70 ${provider.className}`}
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <Icon />
      )}
      Continue with {provider.name}
    </button>
  );
}

export function SignInPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          role="alert"
          className="rounded-control border border-error-bg/40 bg-error-bg/10 px-4 py-3 text-sm text-error-text"
        >
          {ERROR_MESSAGES[error] ?? DEFAULT_ERROR}
        </p>
      )}
      {PROVIDERS.map((provider) => (
        <form key={provider.id} action={signInWith.bind(null, provider.id, callbackUrl)}>
          <ProviderButton provider={provider} />
        </form>
      ))}
    </div>
  );
}

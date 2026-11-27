import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { DeveloperScene } from "@/components/illustrations/DeveloperScene";
import { SignInPanel } from "./SignInPanel";

export const metadata: Metadata = {
  title: "Sign in — MainBranch",
};

function SignInPanelFallback() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-[52px]" />
      <Skeleton className="h-[52px]" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:px-16 md:py-16 lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="flex max-w-[460px] flex-col gap-5">
        <p className="font-mono text-xs text-brass-text">~/signin</p>
        <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-accent-text md:text-[52px]">
          Your seat is <em className="text-brass-text">waiting.</em>
        </h1>
        <p className="leading-relaxed text-text-muted">
          Sign in to join communities, publish posts and keep a reading list.
        </p>
        <div className="mt-2">
          <Suspense fallback={<SignInPanelFallback />}>
            <SignInPanel />
          </Suspense>
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          We only receive your name, email and profile picture.
        </p>
      </section>
      <DeveloperScene className="hidden lg:block" />
    </div>
  );
}

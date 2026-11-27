import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { SignInPanel } from "./SignInPanel";

export const metadata: Metadata = {
  title: "Sign in — MainBranch",
};

function SignInPanelFallback() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-[73px]" />
      <Skeleton className="h-[73px]" />
    </div>
  );
}

function BranchGraph() {
  return (
    <pre
      aria-hidden="true"
      className="font-mono text-sm leading-7 text-text-muted"
    >
      <span className="text-text">*</span> main{"\n"}
      |\{"\n"}
      | <span className="text-accent-text">* you, signing in</span>
      {"\n"}
      |/{"\n"}
      <span className="text-text">*</span> communities · posts · reading list
    </pre>
  );
}

export default function SignInPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-14 px-6 py-14 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-0 md:py-24">
      <div className="md:pr-16">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
          Vol. 01 · Sign in
        </p>
        <h1 className="mt-5 font-display text-5xl leading-[1.05] text-text md:text-6xl">
          Pick up where you{" "}
          <em className="text-accent-text">branched</em> off.
        </h1>
        <p className="mt-6 max-w-md text-text-muted">
          Sign in to join communities, publish posts and keep a reading list.
        </p>
        <div className="mt-10 hidden border-t border-border pt-6 md:block">
          <BranchGraph />
        </div>
      </div>

      <div className="md:border-l md:border-border md:py-6 md:pl-16">
        <Suspense fallback={<SignInPanelFallback />}>
          <SignInPanel />
        </Suspense>
      </div>
    </section>
  );
}

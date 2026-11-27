"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`border-b-2 pb-1 text-sm transition-colors ${
        isActive
          ? "border-brass font-medium text-text"
          : "border-transparent text-text-muted hover:text-text"
      }`}
    >
      {children}
    </Link>
  );
}

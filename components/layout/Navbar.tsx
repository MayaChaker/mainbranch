import Link from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="relative border-b border-border">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg text-text">
          MainBranch
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Explore</NavLink>
          <NavLink href="/communities">Communities</NavLink>
          <NavLink href="/blogs">Blogs</NavLink>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/signin"
            className="text-sm text-text-muted hover:text-text"
          >
            Sign in
          </Link>
          <Link
            href="/signin"
            className="rounded-control border-[0.5px] border-accent px-4 py-2 text-sm text-accent-text hover:bg-surface"
          >
            Join
          </Link>
        </div>
        <MobileMenu />
      </nav>
    </header>
  );
}

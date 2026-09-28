import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  active?: boolean;
};

export function Badge({
  active = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.08em] ${
        active ? "text-accent-text" : "text-text-muted"
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

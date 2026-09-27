import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ error = false, className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-control border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${
        error ? "border-error-bg" : "border-border"
      } ${className}`}
      {...props}
    />
  );
}

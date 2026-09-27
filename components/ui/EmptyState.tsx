import { ReactNode } from "react";
type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center py-16">
      <h2 className="text-lg text-text font-display">{title}</h2>
      {description && (
        <p className="text-sm text-text-muted max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

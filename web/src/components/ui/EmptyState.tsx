import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
      {icon && (
        <div className="mb-5 text-[var(--color-text-faint)] opacity-70">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-text-secondary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-text-tertiary)] max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

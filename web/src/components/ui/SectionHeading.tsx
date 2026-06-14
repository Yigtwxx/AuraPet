import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  trailing,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.08] text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-xl text-sm text-[var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

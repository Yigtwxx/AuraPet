"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-md",
    "transition-all focus-ring select-none",
    "disabled:opacity-40 disabled:pointer-events-none",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white bg-[var(--color-brand-600)]",
          "[box-shadow:var(--shadow-sm)]",
          "hover:bg-[var(--color-brand-700)]",
        ],
        secondary: [
          "bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border-subtle)]",
          "hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)]",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface-glass)] hover:text-[var(--color-text-primary)]",
        ],
        outline: [
          "bg-transparent text-[var(--color-text-primary)]",
          "border border-[var(--color-border-strong)]",
          "hover:bg-[var(--color-surface-glass)] hover:border-[var(--color-border-vivid)]",
        ],
        danger: [
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
          "border border-[var(--color-danger-strong)]",
          "hover:bg-[var(--color-danger-strong)]",
        ],
      },
      size: {
        sm:   "h-8  px-3  text-xs  gap-1.5",
        md:   "h-10 px-4  text-sm",
        lg:   "h-12 px-6  text-base",
        icon: "h-9  w-9   text-sm  p-0 rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, leftIcon, rightIcon, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
        ) : leftIcon}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;

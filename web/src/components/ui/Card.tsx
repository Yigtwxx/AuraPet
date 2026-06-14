"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva(
  [
    "relative rounded-[var(--radius-xl)] overflow-hidden border",
    "transition-all duration-[var(--duration-base)]",
  ],
  {
    variants: {
      variant: {
        flat: [
          "bg-[var(--color-surface-base)] border-[var(--color-border-subtle)]",
        ],
        raised: [
          "bg-[var(--color-surface-raised)] border-[var(--color-border-subtle)]",
          "[box-shadow:var(--shadow-md)]",
          "hover:[box-shadow:var(--shadow-card-hover)]",
        ],
        elevated: [
          "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)]",
          "[box-shadow:var(--shadow-lg)]",
        ],
        solid: [
          "bg-[var(--color-surface-raised)] border-[var(--color-border-subtle)]",
          "[box-shadow:var(--shadow-md)]",
        ],
      },
      padding: {
        none: "",
        sm:   "p-4",
        md:   "p-6",
        lg:   "p-8",
      },
    },
    defaultVariants: { variant: "flat", padding: "md" },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        style={style}
        {...props}
      >
        <div className="relative">{children}</div>
      </div>
    );
  },
);
Card.displayName = "Card";

export { Card, cardVariants };
export default Card;

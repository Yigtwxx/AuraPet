"use client";

import { forwardRef, useState, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floating?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, errorText, leftIcon, rightIcon, floating = false, type, ...props }, ref) => {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value || props.defaultValue);
    const isFloating = floating && label;
    const labelUp = focused || hasValue || Boolean(props.placeholder);

    if (isFloating) {
      return (
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={type}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            placeholder=" "
            className={cn(
              "peer w-full rounded-md px-4 pt-5 pb-2 text-sm font-medium",
              "bg-[var(--color-surface-base)] border",
              "text-[var(--color-text-primary)]",
              "transition-all duration-[var(--duration-fast)]",
              "focus:outline-none focus-ring",
              errorText
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                : "border-[var(--color-border-subtle)] focus:border-[var(--color-brand-500)]",
              "placeholder:text-transparent",
              className,
            )}
            aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            aria-invalid={Boolean(errorText)}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-4 transition-all duration-[var(--duration-fast)]",
              "text-[var(--color-text-tertiary)]",
              "peer-focus:text-[var(--color-brand-400)]",
              labelUp || focused
                ? "top-2 text-xs font-medium scale-90 origin-left"
                : "top-1/2 -translate-y-1/2 text-sm",
            )}
          >
            {label}
          </label>
          {errorText && (
            <p id={`${id}-error`} className="mt-1.5 text-xs text-[var(--color-danger)]">
              {errorText}
            </p>
          )}
          {helperText && !errorText && (
            <p id={`${id}-helper`} className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-[var(--color-text-tertiary)]">{leftIcon}</span>
          )}
          <input
            id={id}
            ref={ref}
            type={type}
            className={cn(
              "w-full rounded-md text-sm font-medium",
              "bg-[var(--color-surface-base)] border",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)]",
              "transition-all duration-[var(--duration-fast)]",
              "focus:outline-none focus-ring",
              errorText
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                : "border-[var(--color-border-subtle)] focus:border-[var(--color-brand-500)]",
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              "py-2.5",
              className,
            )}
            aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            aria-invalid={Boolean(errorText)}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-tertiary)]">{rightIcon}</span>
          )}
        </div>
        {errorText && (
          <p id={`${id}-error`} className="mt-1.5 text-xs text-[var(--color-danger)]">{errorText}</p>
        )}
        {helperText && !errorText && (
          <p id={`${id}-helper`} className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import Button from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message = "Bir şeyler ters gitti.", onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <div className="mb-4 rounded-full bg-[var(--color-danger-soft)] p-3 text-[var(--color-danger)]">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tekrar dene
        </Button>
      )}
    </div>
  );
}

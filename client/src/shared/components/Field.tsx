import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-semibold text-destructive">{error}</span> : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <input
        className={cn(
          "h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, className, ...props }: TextareaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        className={cn(
          "min-h-24 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Select({ label, hint, error, className, children, ...props }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <select
        className={cn(
          "h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

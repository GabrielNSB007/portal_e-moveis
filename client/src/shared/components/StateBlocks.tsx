import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-3xl border border-border bg-card p-8 text-center shadow-card">
      <div className="grid gap-3 place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-card">
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-card">
      <AlertCircle className="mx-auto size-9 text-destructive" />
      <h3 className="mt-3 text-xl font-bold text-foreground">Algo deu errado</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
      {onRetry ? <Button className="mt-5" variant="secondary" onClick={onRetry}>Tentar novamente</Button> : null}
    </div>
  );
}

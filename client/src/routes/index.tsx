import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/emoveis/Logo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const done = typeof window !== "undefined" && localStorage.getItem("emoveis-onboarded") === "1";
    navigate({ to: done ? "/explore" : "/onboarding", replace: true });
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero">
      <div className="flex flex-col items-center gap-3">
        <Logo />
        <span className="text-xs text-muted-foreground">carregando…</span>
      </div>
    </div>
  );
}

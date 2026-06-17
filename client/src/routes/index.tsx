import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/emoveis/Logo";
import { getAuthToken, hasCompletedOnboarding, migrateLegacyOnboardingFlag } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = typeof window !== "undefined" && getAuthToken();
    if (token) {
      migrateLegacyOnboardingFlag();
    }
    const done = typeof window !== "undefined" && hasCompletedOnboarding();
    navigate({ to: !token ? "/auth" : done ? "/explore" : "/onboarding", replace: true });
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

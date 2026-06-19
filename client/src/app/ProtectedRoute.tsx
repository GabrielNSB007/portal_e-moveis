import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/shared/components/StateBlocks";
import { useAuth } from "@/modules/auth/components/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen p-4"><LoadingState message="Verificando sessão..." /></div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

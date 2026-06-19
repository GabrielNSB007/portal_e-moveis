import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/components/AuthProvider";

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/matches" replace />;
  }

  return children;
}

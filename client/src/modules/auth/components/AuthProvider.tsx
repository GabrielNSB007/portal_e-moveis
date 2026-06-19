import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/shared/api/tokenStorage";
import type { User } from "@/shared/types/domain";
import { getProfile } from "../api/authApi";

export type ProfileMode = "buyer" | "seller";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  profileMode: ProfileMode;
  canUseSeller: boolean;
  saveSession: (token: string, user?: User | null) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setProfileMode: (mode: ProfileMode) => void;
  activateSellerMode: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const MODE_STORAGE_KEY = "portal-emoveis-profile-mode";
const SELLER_STORAGE_PREFIX = "portal-emoveis-seller-enabled";

function readStoredMode(): ProfileMode {
  if (typeof window === "undefined") return "buyer";
  return window.localStorage.getItem(MODE_STORAGE_KEY) === "seller" ? "seller" : "buyer";
}

function sellerStorageKey(user?: User | null) {
  return `${SELLER_STORAGE_PREFIX}:${user?.email ?? "anonymous"}`;
}

function readSellerEnabled(user?: User | null) {
  if (!user || typeof window === "undefined") return false;
  return user.role === "VENDEDOR" || window.localStorage.getItem(sellerStorageKey(user)) === "true";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [profileModeState, setProfileModeState] = useState<ProfileMode>(() => readStoredMode());
  const [sellerEnabled, setSellerEnabled] = useState(false);

  async function refreshProfile() {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await getProfile();
      setUser(profile);
      const enabled = readSellerEnabled(profile);
      setSellerEnabled(enabled);

      if (!enabled && readStoredMode() === "seller") {
        setProfileModeState("buyer");
        window.localStorage.setItem(MODE_STORAGE_KEY, "buyer");
      }
    } catch {
      clearAuthToken();
      setToken(null);
      setUser(null);
      setSellerEnabled(false);
      setProfileModeState("buyer");
    } finally {
      setLoading(false);
    }
  }

  function saveSession(nextToken: string, nextUser?: User | null) {
    setAuthToken(nextToken);
    setToken(nextToken);
    if (nextUser) {
      setUser(nextUser);
      const enabled = readSellerEnabled(nextUser);
      setSellerEnabled(enabled);
      setProfileModeState("buyer");
      window.localStorage.setItem(MODE_STORAGE_KEY, "buyer");
    }
  }

  function logout() {
    clearAuthToken();
    setToken(null);
    setUser(null);
    setSellerEnabled(false);
    setProfileModeState("buyer");
    window.localStorage.setItem(MODE_STORAGE_KEY, "buyer");
  }

  function setProfileMode(mode: ProfileMode) {
    if (mode === "seller" && !sellerEnabled && user?.role !== "VENDEDOR") return;
    setProfileModeState(mode);
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }

  function activateSellerMode() {
    if (user) {
      window.localStorage.setItem(sellerStorageKey(user), "true");
    }
    setSellerEnabled(true);
    setProfileModeState("seller");
    window.localStorage.setItem(MODE_STORAGE_KEY, "seller");
  }

  useEffect(() => {
    void refreshProfile();
  }, []);

  const canUseSeller = sellerEnabled || user?.role === "VENDEDOR";
  const profileMode = profileModeState === "seller" && canUseSeller ? "seller" : "buyer";

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      profileMode,
      canUseSeller,
      saveSession,
      logout,
      refreshProfile,
      setProfileMode,
      activateSellerMode,
    }),
    [canUseSeller, loading, profileMode, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }

  return context;
}

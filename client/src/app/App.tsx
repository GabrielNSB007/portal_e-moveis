import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/shared/components/AppShell";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { RegisterPage } from "@/modules/auth/pages/RegisterPage";
import { SellerRegisterPage } from "@/modules/auth/pages/SellerRegisterPage";
import { ProfilePage } from "@/modules/auth/pages/ProfilePage";
import { PreferenceOnboardingPage } from "@/modules/preferences/pages/PreferenceOnboardingPage";
import { PreferencesPage } from "@/modules/preferences/pages/PreferencesPage";
import { MatchesPage } from "@/modules/matches/pages/MatchesPage";
import { NotificationsPage } from "@/modules/matches/pages/NotificationsPage";
import { DiscoverPage } from "@/modules/offers/pages/DiscoverPage";
import { AdvertiserPage } from "@/modules/offers/pages/AdvertiserPage";
import { OfferDetailsPage } from "@/modules/offers/pages/OfferDetailsPage";
import { ProposalsPage } from "@/modules/proposals/pages/ProposalsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/discover" replace />} />
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/register-seller" element={<SellerRegisterPage />} />
      <Route
        path="/onboarding/preferences"
        element={
          <ProtectedRoute>
            <PreferenceOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <AppShell><DiscoverPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <AppShell><MatchesPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppShell><NotificationsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/preferences"
        element={
          <ProtectedRoute>
            <AppShell><PreferencesPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/advertiser"
        element={
          <ProtectedRoute>
            <AppShell><AdvertiserPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers/:offerId"
        element={
          <ProtectedRoute>
            <AppShell><OfferDetailsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposals"
        element={
          <ProtectedRoute>
            <AppShell><ProposalsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell><ProfilePage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}

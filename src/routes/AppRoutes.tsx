import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import DashboardPage from "../pages/dashboard/DashboardPage";
import AssetsPage from "../pages/assets/AssetsPage";
import ScansPage from "../pages/scans/ScansPage";
import IssuesPage from "../pages/issues/IssuesPage";
import ScorePage from "../pages/score/ScorePage";
import HistoryPage from "../pages/history/HistoryPage";
import SubscriptionPage from "../pages/subscription/SubscriptionPage";
import SubscriptionPlanPage from "../pages/subscriptionPlan/SubscriptionPlanPage";
import SettingsPage from "../pages/settings/SettingsPage";


import { OrganizationProvider, useOrganization } from "../contexts/OrganizationContext";
import { EasmStoreProvider } from "../contexts/EasmStore";

import type React from "react";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useOrganization();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}


export default function AppRoutes() {
  return (
    <OrganizationProvider>
      <EasmStoreProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/scans" element={<ScansPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/score" element={<ScorePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription-plan" element={<SubscriptionPlanPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </EasmStoreProvider>
    </OrganizationProvider>
  );
}

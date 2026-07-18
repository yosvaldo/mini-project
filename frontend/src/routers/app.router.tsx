import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import ProfilePage from "../pages/profile/ProfilePage";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DashboardEvents from "../pages/dashboard/DashboardEvents";
import DashboardTransactions from "../pages/dashboard/DashboardTransactions";
import NotFoundPage from "../pages/errors/NotFoundPage"

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "CUSTOMER" | "ORGANIZER";
}

function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/checkout/:eventId"
        element={
          <ProtectedRoute allowedRole="CUSTOMER">
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <DashboardOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/events"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <DashboardEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/transactions"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <DashboardTransactions />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
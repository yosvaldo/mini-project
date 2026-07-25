import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import Navbar from "../components/Navbar";
import HomePage from "../pages/home/HomePage";
import EventsList from "../pages/events/EventsList";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import ProfilePage from "../pages/profile/ProfilePage";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DashboardEvents from "../pages/dashboard/DashboardEvents";
import DashboardTransactions from "../pages/dashboard/DashboardTransactions";
import NotFoundPage from "../pages/errors/NotFoundPage";

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

function MainLayout() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-eventura-navy text-slate-100 flex flex-col">
      <Navbar isLoggedIn={!!user} onLogout={signOut} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsList />} />
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
      </Route>
    </Routes>
  );
}
import { Routes, Route, Outlet } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";

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
import CreateEvent from "../pages/organizer/CreateEvent";
import NotFoundPage from "../pages/errors/NotFoundPage";

function MainLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-eventura-navy text-slate-100 flex flex-col">
      <Navbar isLoggedIn={!!user} onLogout={logout} />
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

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

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
          path="/dashboard/events/create"
          element={
            <ProtectedRoute allowedRole="ORGANIZER">
              <CreateEvent />
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
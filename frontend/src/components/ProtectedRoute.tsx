import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "CUSTOMER" | "ORGANIZER";
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
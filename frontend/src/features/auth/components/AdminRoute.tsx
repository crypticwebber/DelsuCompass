import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export function AdminRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <div className="grid min-h-screen place-items-center">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "administrator") return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}

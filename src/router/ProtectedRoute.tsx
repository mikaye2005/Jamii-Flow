import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const authQuery = useAuth();

  if (authQuery.isLoading) {
    return <p>Checking session...</p>;
  }

  if (authQuery.isError || !authQuery.data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

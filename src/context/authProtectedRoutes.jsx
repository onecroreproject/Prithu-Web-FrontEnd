import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Redirect to login page, but keep the original destination
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />
    );
  }

  return children;
}

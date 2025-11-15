import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    const redirectUrl = encodeURIComponent(
      location.pathname + location.search
    );

    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return children;
}

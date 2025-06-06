import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    // You can customize this loading UI as you want
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

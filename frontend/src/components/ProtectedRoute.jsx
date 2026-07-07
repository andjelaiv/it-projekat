import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  if (!token) {
    return <Navigate to="/prijava-potrebna" replace />;
  }

  if (adminOnly && currentUser?.role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  return children;
}

export default ProtectedRoute;
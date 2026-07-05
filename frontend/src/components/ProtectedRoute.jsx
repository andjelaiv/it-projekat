import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/prijava-potrebna" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/prijava-potrebna" replace />;
  }

  return children;
}

export default ProtectedRoute;
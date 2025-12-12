import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole: "admin" | "vehicle";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn || role !== requiredRole) {
    return (
      <Navigate
        to={requiredRole === "admin" ? "/admin-login" : "/vehicle-login"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
import { Outlet, Navigate } from "react-router-dom";
import { hasAuthTokens } from "../middleware/auth";

/**
 * Auth Layout with Public Route Protection
 * Redirects authenticated users away from login/register pages
 */
const AuthLayout = () => {
  // If user is already authenticated, redirect to dashboard
  if (hasAuthTokens()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AuthLayout;


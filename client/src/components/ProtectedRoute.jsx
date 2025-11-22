import { Navigate } from 'react-router-dom';
import { hasAuthTokens } from '../middleware/auth';

/**
 * Protected Route Middleware
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = hasAuthTokens();

  if (!isAuthenticated) {
    // Redirect to login if no tokens found
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;


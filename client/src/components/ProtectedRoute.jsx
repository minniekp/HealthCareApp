import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = api.auth.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;


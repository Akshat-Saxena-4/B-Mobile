import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader fullscreen label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;


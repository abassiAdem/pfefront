import { useSelector } from 'react-redux';
import { Navigate} from 'react-router-dom';

import { Outlet } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (location.pathname === '/unauthorized') {
    return <Outlet />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const RoleBasedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, roles } = useSelector((state) => state.auth);
  const location = useLocation();

  if (location.pathname === '/unauthorized') {
    return <Outlet />;
  }

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = allowedRoles.some(role =>
    roles?.realmRoles?.includes(role) || roles?.clientRoles?.includes(role)
  );

  return hasRequiredRole ? <Outlet /> : <Navigate to="/unauthorized" state={{ from: location }} replace />;
};
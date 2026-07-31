import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  // Login is admin-only; kick stale non-admin sessions
  if (user && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

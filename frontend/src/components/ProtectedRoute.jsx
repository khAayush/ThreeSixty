import { Navigate, useLocation } from 'react-router';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // 1. Get auth data from localStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 2. Check if user is logged in
  if (!token || !user) {
    // Redirect to login and save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin" || user.role === "manager") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Everything is fine, render the page
  return children;
};

export default ProtectedRoute;
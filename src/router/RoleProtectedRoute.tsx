import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RootState } from "../reducer/store/store";
import { UserRole } from "../types/UserType";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const location = useLocation();
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.users
  );

  if (!isLoggedIn || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user role matches the allowed roles
  if (!allowedRoles.includes(userData.data.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;

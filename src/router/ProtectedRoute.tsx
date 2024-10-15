import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RootState } from "../reducer/store/store";

const ProtectedRoute = () => {
  const location = useLocation();
  const { isLoggedIn } = useSelector((state: RootState) => state.users);

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;

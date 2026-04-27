import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RootState } from "../reducer/store/store";

/**
 * Route guard for authenticated areas of the app.
 *
 * Wraps a group of routes and redirects to /login if the user is not
 * logged in. Once past this guard, any logged-in user can access any
 * route inside it — there is no further role differentiation in the app.
 *
 * Renders nothing during boot-time hydration (when App.tsx is refetching
 * the user based on the localStorage flag). Without this gate, a logged-in
 * user who refreshes the page would briefly get bounced to /login in the
 * window before userData arrives.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const { isLoggedIn, userData, isHydrating } = useSelector(
    (state: RootState) => state.users
  );

  if (isHydrating) {
    // Boot fetch in flight — don't make a routing decision yet.
    return null;
  }

  if (!isLoggedIn || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
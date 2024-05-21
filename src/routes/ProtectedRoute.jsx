import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import config from "config";
import { DEMO_PASSWORD, DEMO_USER } from "services/auth";
import { selectAuthStatus, selectIsAuthenticated, signIn } from "store/authSlice";
import TaskRowSkeleton from "components/shared/TaskRowSkeleton";

/**
 * Gate for everything behind a session.
 *
 * In demo mode there is no backend to authenticate against, so the guard opens
 * a demo session itself rather than bouncing a first-time visitor to a sign-in
 * form that would accept anything. After an explicit sign-out, and always with
 * a real API configured, it redirects to the sign-in form.
 */
export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);

  const signedOut = authStatus === "signedOut";
  const shouldAutoSignIn =
    config.demoMode && !isAuthenticated && !signedOut && authStatus !== "loading";

  useEffect(() => {
    if (shouldAutoSignIn) {
      dispatch(signIn({ email: DEMO_USER.email, password: DEMO_PASSWORD }));
    }
  }, [dispatch, shouldAutoSignIn]);

  if (isAuthenticated) return <Outlet />;
  if (config.demoMode && !signedOut) return <TaskRowSkeleton rows={4} />;
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;

import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import config from "config";
import { DEMO_USER } from "services/auth";
import { selectAuthStatus, selectIsAuthenticated, signIn } from "store/authSlice";
import { DEMO_PASSWORD } from "modules/Authorization";
import TaskRowSkeleton from "components/shared/TaskRowSkeleton";

/**
 * Gate for everything behind a session.
 *
 * In demo mode there is no backend to authenticate against, so the guard opens
 * a demo session itself rather than bouncing a first-time visitor to a sign-in
 * form that would accept anything. With a real API configured it redirects.
 */
export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);

  const shouldAutoSignIn =
    config.demoMode && !isAuthenticated && authStatus !== "loading";

  useEffect(() => {
    if (shouldAutoSignIn) {
      dispatch(signIn({ email: DEMO_USER.email, password: DEMO_PASSWORD }));
    }
  }, [dispatch, shouldAutoSignIn]);

  if (isAuthenticated) return <Outlet />;
  if (config.demoMode) return <TaskRowSkeleton rows={4} />;
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;

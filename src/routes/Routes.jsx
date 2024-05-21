import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AppShell from "components/layouts";
import TaskRowSkeleton from "components/shared/TaskRowSkeleton";
import ProtectedRoute from "routes/ProtectedRoute";

// Each screen is its own chunk: a visitor on /login never downloads the board,
// and the board never downloads the sign-in form.
const AuthPage = lazy(() => import("modules/Authorization"));
const TaskBoard = lazy(() => import("modules/Tasks"));
const NotFound = lazy(() => import("components/shared/NotFound"));

export const AppRoutes = () => (
  <Suspense fallback={<TaskRowSkeleton rows={4} />}>
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <AppShell>
              <TaskBoard />
            </AppShell>
          }
        />
      </Route>
      <Route path="/login" element={<AuthPage isSignIn />} />
      <Route path="/sign-up" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;

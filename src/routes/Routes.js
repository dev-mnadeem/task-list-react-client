import React from "react";
import { Route, Routes } from "react-router-dom";

import AppShell from "components/layouts";
import NotFound from "components/shared/NotFound";
import AuthPage from "modules/Authorization";
import TaskBoard from "modules/Tasks";
import ProtectedRoute from "routes/ProtectedRoute";

export const AppRoutes = () => (
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
);

export default AppRoutes;

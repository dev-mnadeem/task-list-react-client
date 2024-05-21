import React, { useEffect } from "react";
import { Alert, Box, Button, Divider, Paper, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Form, Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import config from "config";
import { palette } from "theme";
import { FormTextField } from "components/shared/fields";
import { DEMO_USER } from "services/auth";
import {
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  signIn,
  signUp,
} from "store/authSlice";
import { schemaFor } from "modules/Authorization/validationSchema";

const DEMO_PASSWORD = "demo-password";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const AuthPage = ({ isSignIn = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const submit = (values) => dispatch(isSignIn ? signIn(values) : signUp(values));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 3 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            backgroundColor: palette.brand,
            color: "#fff",
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="h2">Task Vault</Typography>
      </Box>

      <Paper sx={{ width: "100%", maxWidth: 420, p: { xs: 3, sm: 4 } }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          {isSignIn ? "Sign in" : "Create an account"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {isSignIn
            ? "Pick up your board where you left it."
            : "It takes about twenty seconds."}
        </Typography>

        {authError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {authError}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={schemaFor(isSignIn)}
          onSubmit={submit}
        >
          {() => (
            <Form noValidate>
              {!isSignIn && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormTextField
                    name="firstName"
                    label="First name"
                    placeholder="Ada"
                  />
                  <FormTextField
                    name="lastName"
                    label="Last name"
                    placeholder="Lovelace"
                  />
                </Box>
              )}
              <FormTextField
                name="email"
                label="Email address"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
              <FormTextField
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
              />
              {!isSignIn && (
                <FormTextField
                  name="confirmPassword"
                  label="Confirm password"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                />
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={authStatus === "loading"}
                sx={{ mt: 1 }}
              >
                {authStatus === "loading"
                  ? "Please wait…"
                  : isSignIn
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </Form>
          )}
        </Formik>

        {config.demoMode && (
          <>
            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption">or</Typography>
            </Divider>
            <Button
              fullWidth
              variant="outlined"
              onClick={() =>
                dispatch(signIn({ email: DEMO_USER.email, password: DEMO_PASSWORD }))
              }
            >
              Continue with the demo account
            </Button>
          </>
        )}

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          {isSignIn ? "No account yet?" : "Already registered?"}{" "}
          <Box
            component="button"
            type="button"
            onClick={() => navigate(isSignIn ? "/sign-up" : "/login")}
            sx={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: palette.brand,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isSignIn ? "Create one" : "Sign in"}
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export { DEMO_PASSWORD };
export default AuthPage;

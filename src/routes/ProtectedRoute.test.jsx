import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import theme from "theme";
import AppRoutes from "routes/Routes";
import { createAppStore } from "store";

// The test environment has no API base URL, so the app runs in demo mode.
const renderApp = () =>
  render(
    <Provider store={createAppStore()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

beforeEach(() => window.localStorage.clear());

describe("ProtectedRoute in demo mode", () => {
  it("opens a demo session for a first-time visitor", async () => {
    renderApp();
    expect(
      await screen.findByRole("heading", { name: "Your board" })
    ).toBeInTheDocument();
  });

  it("stays signed out after Sign out instead of signing straight back in", async () => {
    renderApp();
    await screen.findByRole("heading", { name: "Your board" });

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your board" })
    ).not.toBeInTheDocument();
  });
});

import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

import ErrorBoundary from "components/shared/ErrorBoundary";
import AppRoutes from "routes/Routes";
import theme from "theme";
import { persistor, store } from "store";
import "react-toastify/dist/ReactToastify.css";

export const App = () => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            theme="light"
          />
        </BrowserRouter>
      </ThemeProvider>
    </PersistGate>
  </Provider>
);

export default App;

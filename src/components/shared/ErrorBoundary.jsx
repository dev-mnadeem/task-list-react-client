import React, { Component } from "react";
import { Box, Button, Typography } from "@mui/material";

/**
 * Catches render-time errors so a single bad task row cannot blank the app.
 * Errors are logged rather than shown: the message on screen stays useful to a
 * user, the stack stays in the console for whoever is debugging.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 1.5,
          px: 3,
        }}
      >
        <Typography variant="h2">Something went wrong</Typography>
        <Typography variant="body2" sx={{ maxWidth: 400 }}>
          The board could not be rendered. Reloading usually clears it — the details are
          in the browser console.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 1 }}
          onClick={() => window.location.reload()}
        >
          Reload the page
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;

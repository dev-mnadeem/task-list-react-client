import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const NotFound = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 3,
      gap: 1.5,
    }}
  >
    <Typography variant="overline">Error 404</Typography>
    <Typography variant="h1">This page does not exist</Typography>
    <Typography variant="body1" sx={{ maxWidth: 420, color: "text.secondary" }}>
      The link may be out of date, or the task it pointed at has been deleted.
    </Typography>
    <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
      Back to the board
    </Button>
  </Box>
);

export default NotFound;

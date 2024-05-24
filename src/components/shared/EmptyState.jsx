import React from "react";
import { Box, Button, Typography } from "@mui/material";

import { palette } from "theme";

/**
 * The empty board is the first thing a new user sees, so it says what happened,
 * why, and what to do about it — never just "No data".
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      py: 8,
      px: 3,
    }}
  >
    {Icon && (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          backgroundColor: palette.brandSoft,
          color: palette.brand,
          mb: 2.5,
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>
    )}
    <Typography variant="h3" sx={{ mb: 0.75 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ maxWidth: 380 }}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction} sx={{ mt: 3 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;

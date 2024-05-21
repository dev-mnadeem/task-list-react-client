import React from "react";
import { Box, Container, Link, Typography } from "@mui/material";

import config from "config";
import { palette } from "theme";

export const Footer = () => (
  <Box
    component="footer"
    sx={{
      mt: 8,
      py: 3,
      borderTop: `1px solid ${palette.border}`,
      backgroundColor: palette.surface,
    }}
  >
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption">Task Vault — a React task board.</Typography>
        <Typography variant="caption">
          {config.demoMode ? (
            "Running against the in-browser demo repository."
          ) : (
            <>
              Connected to{" "}
              <Link
                href={config.apiBaseUrl}
                underline="hover"
                color="inherit"
                rel="noreferrer"
              >
                {config.apiBaseUrl}
              </Link>
            </>
          )}
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;

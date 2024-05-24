import React from "react";
import { Box, Container } from "@mui/material";

import config from "config";
import DemoBanner from "components/layouts/DemoBanner";
import Footer from "components/layouts/Footer";
import Header from "components/layouts/Header";

/**
 * Page chrome: sticky header, optional demo banner, a single content column and
 * a footer that names whatever data source is in use.
 */
export const AppShell = ({ children }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "background.default",
    }}
  >
    <Header />
    {config.demoMode && <DemoBanner />}
    <Box component="main" sx={{ flex: 1 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {children}
      </Container>
    </Box>
    <Footer />
  </Box>
);

export default AppShell;

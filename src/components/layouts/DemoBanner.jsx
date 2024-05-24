import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import { useDispatch } from "react-redux";

import { palette } from "theme";
import { resetDemoTasks } from "store/tasksSlice";

/**
 * Shown only in demo mode. It exists so nobody mistakes the seeded board for
 * live data, and so the seed can be restored after it has been played with.
 */
export const DemoBanner = () => {
  const dispatch = useDispatch();

  return (
    <Box
      sx={{
        backgroundColor: palette.brandSoft,
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flexWrap: "wrap",
            py: 1,
          }}
        >
          <ScienceRoundedIcon sx={{ fontSize: 17, color: palette.brand }} />
          <Typography variant="body2" sx={{ color: palette.brandDark, flex: 1 }}>
            <strong>Demo mode.</strong> Tasks are stored in this browser only — set{" "}
            <code>REACT_APP_API_BASE_URL</code> to talk to a real API.
          </Typography>
          <Button
            size="small"
            onClick={() => dispatch(resetDemoTasks())}
            sx={{ color: palette.brandDark }}
          >
            Reset sample data
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default DemoBanner;

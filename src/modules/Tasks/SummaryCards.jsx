import React from "react";
import { Box, Paper, Typography } from "@mui/material";

import { palette } from "theme";
import { TaskStatus } from "domain/task";

const CARDS = [
  { key: "total", label: "All tasks", accent: palette.ink },
  { key: TaskStatus.IN_PROGRESS, label: "In progress", accent: palette.info },
  { key: TaskStatus.COMPLETED, label: "Completed", accent: palette.success },
  { key: "overdue", label: "Overdue", accent: palette.danger },
];

export const SummaryCards = ({ summary }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
      gap: 2,
    }}
  >
    {CARDS.map(({ key, label, accent }) => (
      <Paper key={key} sx={{ px: 2.5, py: 1.75 }}>
        <Typography variant="overline">{label}</Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "1.625rem",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {summary[key] ?? 0}
        </Typography>
      </Paper>
    ))}
  </Box>
);

export default SummaryCards;

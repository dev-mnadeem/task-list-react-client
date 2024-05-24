import React from "react";
import { Box, Skeleton } from "@mui/material";

import { palette } from "theme";

/**
 * Skeleton rows rather than a blocking spinner: the page keeps its shape while
 * the first fetch is in flight, so nothing jumps when the data lands.
 */
export const TaskRowSkeleton = ({ rows = 5 }) => (
  <Box aria-busy="true" aria-label="Loading tasks">
    {Array.from({ length: rows }, (_, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Skeleton variant="circular" width={20} height={20} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={`${40 + ((index * 13) % 35)}%`} height={18} />
          <Skeleton variant="text" width={`${55 + ((index * 7) % 25)}%`} height={14} />
        </Box>
        <Skeleton variant="rounded" width={70} height={22} />
        <Skeleton variant="rounded" width={90} height={22} />
      </Box>
    ))}
  </Box>
);

export default TaskRowSkeleton;

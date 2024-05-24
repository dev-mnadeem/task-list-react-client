import React from "react";
import { Box, Chip } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import { palette } from "theme";
import { statusLabel, TaskPriority, TaskStatus } from "domain/task";

const STATUS_STYLE = {
  [TaskStatus.PENDING]: {
    color: palette.inkMuted,
    bg: "#EEF0F5",
    Icon: RadioButtonUncheckedRoundedIcon,
  },
  [TaskStatus.IN_PROGRESS]: {
    color: palette.info,
    bg: palette.infoSoft,
    Icon: AutorenewRoundedIcon,
  },
  [TaskStatus.COMPLETED]: {
    color: palette.success,
    bg: palette.successSoft,
    Icon: CheckCircleRoundedIcon,
  },
};

const PRIORITY_STYLE = {
  [TaskPriority.HIGH]: { color: palette.danger, bg: palette.dangerSoft },
  [TaskPriority.MEDIUM]: { color: palette.warning, bg: palette.warningSoft },
  [TaskPriority.LOW]: { color: palette.inkMuted, bg: "#EEF0F5" },
};

export const statusStyle = (status) =>
  STATUS_STYLE[status] ?? STATUS_STYLE[TaskStatus.PENDING];

export const StatusChip = ({ status }) => {
  const { color, bg, Icon } = statusStyle(status);
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: 14, color: `${color} !important` }} />}
      label={statusLabel(status)}
      sx={{ color, backgroundColor: bg, pl: 0.25, "& .MuiChip-label": { pr: 1 } }}
    />
  );
};

/** A dot plus a word: cheaper to scan down a column than a full chip. */
export const PriorityTag = ({ priority }) => {
  const { color } = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE[TaskPriority.LOW];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Box
        component="span"
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color,
          textTransform: "capitalize",
        }}
      >
        {priority}
      </Box>
    </Box>
  );
};

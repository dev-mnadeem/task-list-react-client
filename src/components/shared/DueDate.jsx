import React from "react";
import { Box } from "@mui/material";
import EventRoundedIcon from "@mui/icons-material/EventRounded";

import { palette } from "theme";

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/**
 * "Today", "Tomorrow", "3 days ago", then a plain date once relative wording
 * stops being more informative than the date itself.
 */
export const describeDeadline = (value, now = new Date()) => {
  if (!value) return { text: "No deadline", tone: "muted" };
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) return { text: "No deadline", tone: "muted" };

  const days = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / DAY_MS
  );

  if (days < 0) {
    const ago = Math.abs(days);
    return { text: ago === 1 ? "Yesterday" : `${ago} days ago`, tone: "overdue" };
  }
  if (days === 0) return { text: "Today", tone: "urgent" };
  if (days === 1) return { text: "Tomorrow", tone: "urgent" };
  if (days <= 6) return { text: `In ${days} days`, tone: "soon" };
  return {
    text: `${MONTHS[due.getMonth()]} ${due.getDate()}`,
    tone: "normal",
  };
};

const TONE = {
  overdue: { color: palette.danger, bg: palette.dangerSoft },
  urgent: { color: palette.warning, bg: palette.warningSoft },
  soon: { color: palette.inkMuted, bg: "#EEF0F5" },
  normal: { color: palette.inkMuted, bg: "transparent" },
  muted: { color: palette.inkFaint, bg: "transparent" },
};

export const DueDate = ({ value, completed = false }) => {
  const { text, tone } = describeDeadline(value);
  const effective = completed && tone === "overdue" ? "normal" : tone;
  const { color, bg } = TONE[effective];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.625,
        px: bg === "transparent" ? 0 : 0.875,
        py: bg === "transparent" ? 0 : 0.25,
        borderRadius: 1.5,
        color,
        backgroundColor: bg,
        fontSize: "0.8125rem",
        fontWeight: effective === "overdue" ? 650 : 500,
        whiteSpace: "nowrap",
      }}
    >
      <EventRoundedIcon sx={{ fontSize: 15 }} />
      {text}
    </Box>
  );
};

export default DueDate;

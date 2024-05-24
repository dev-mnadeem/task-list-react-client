import React from "react";
import { Box, Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { palette } from "theme";
import {
  priorityLabel,
  statusLabel,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "domain/task";
import { ALL, SortOrder } from "domain/taskQuery";

const SORT_LABELS = {
  [SortOrder.DEADLINE]: "Deadline",
  [SortOrder.PRIORITY]: "Priority",
  [SortOrder.TITLE]: "Title",
};

const selectSx = { minWidth: 150 };

export const FilterBar = ({ query, onChange, onCreate }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 1.5,
      alignItems: "center",
    }}
  >
    <TextField
      size="small"
      value={query.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search titles and descriptions"
      inputProps={{ "aria-label": "Search tasks" }}
      sx={{ flex: "1 1 260px", minWidth: 220 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ fontSize: 18, color: palette.inkFaint }} />
          </InputAdornment>
        ),
      }}
    />

    <TextField
      select
      size="small"
      label="Status"
      value={query.status}
      onChange={(event) => onChange({ status: event.target.value })}
      sx={selectSx}
    >
      <MenuItem value={ALL}>All statuses</MenuItem>
      {TASK_STATUSES.map((status) => (
        <MenuItem key={status} value={status}>
          {statusLabel(status)}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      select
      size="small"
      label="Priority"
      value={query.priority}
      onChange={(event) => onChange({ priority: event.target.value })}
      sx={selectSx}
    >
      <MenuItem value={ALL}>All priorities</MenuItem>
      {TASK_PRIORITIES.map((priority) => (
        <MenuItem key={priority} value={priority}>
          {priorityLabel(priority)}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      select
      size="small"
      label="Sort by"
      value={query.sort}
      onChange={(event) => onChange({ sort: event.target.value })}
      sx={selectSx}
    >
      {Object.entries(SORT_LABELS).map(([value, label]) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>

    <Button
      variant="contained"
      startIcon={<AddRoundedIcon />}
      onClick={onCreate}
      sx={{ ml: { md: "auto" } }}
    >
      New task
    </Button>
  </Box>
);

export default FilterBar;

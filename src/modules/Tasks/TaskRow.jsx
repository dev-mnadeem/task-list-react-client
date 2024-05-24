import React, { useState } from "react";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { palette } from "theme";
import { statusLabel, TASK_STATUSES, TaskStatus } from "domain/task";
import { DueDate } from "components/shared/DueDate";
import { PriorityTag, statusStyle } from "components/shared/labels";

/**
 * Clicking the status icon advances the task to the next status; the overflow
 * menu still offers every status explicitly for anyone who wants to jump.
 */
const nextStatus = (status) => {
  const index = TASK_STATUSES.indexOf(status);
  return TASK_STATUSES[(index + 1) % TASK_STATUSES.length];
};

export const TaskRow = ({ task, onEdit, onDelete, onStatusChange, isLast }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { color, Icon } = statusStyle(task.status);
  const done = task.status === TaskStatus.COMPLETED;

  const close = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderBottom: isLast ? "none" : `1px solid ${palette.border}`,
        transition: "background-color 120ms ease",
        "&:hover": { backgroundColor: "#FAFBFD" },
      }}
    >
      <Tooltip title={`Mark as ${statusLabel(nextStatus(task.status))}`}>
        <IconButton
          size="small"
          aria-label={`Change status of ${task.title}`}
          onClick={() => onStatusChange(task, nextStatus(task.status))}
          sx={{ color }}
        >
          <Icon sx={{ fontSize: 21 }} />
        </IconButton>
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: done ? palette.inkFaint : palette.ink,
            textDecoration: done ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </Typography>
        {task.description && (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: 92, display: { xs: "none", md: "block" } }}>
        <PriorityTag priority={task.priority} />
      </Box>

      <Box sx={{ width: 112, display: { xs: "none", sm: "block" } }}>
        <DueDate value={task.deadline} completed={done} />
      </Box>

      <IconButton
        size="small"
        aria-label={`Actions for ${task.title}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ color: palette.inkFaint }}
      >
        <MoreHorizRoundedIcon sx={{ fontSize: 19 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            close();
            onEdit(task);
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit task</ListItemText>
        </MenuItem>

        {TASK_STATUSES.filter((status) => status !== task.status).map((status) => {
          const { Icon: StatusIcon } = statusStyle(status);
          return (
            <MenuItem
              key={status}
              onClick={() => {
                close();
                onStatusChange(task, status);
              }}
            >
              <ListItemIcon>
                <StatusIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark as {statusLabel(status).toLowerCase()}</ListItemText>
            </MenuItem>
          );
        })}

        <MenuItem
          onClick={() => {
            close();
            onDelete(task);
          }}
          sx={{ color: palette.danger }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" sx={{ color: palette.danger }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskRow;

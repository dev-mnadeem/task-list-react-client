import React from "react";
import { Box, Pagination, Paper, Typography } from "@mui/material";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { palette } from "theme";
import EmptyState from "components/shared/EmptyState";
import TaskRowSkeleton from "components/shared/TaskRowSkeleton";
import TaskRow from "modules/Tasks/TaskRow";

const Header = ({ total, shown }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2.5,
      py: 1.5,
      borderBottom: `1px solid ${palette.border}`,
    }}
  >
    <Typography variant="overline">Tasks</Typography>
    <Typography variant="caption">
      {total === 0 ? "nothing to show" : `showing ${shown} of ${total}`}
    </Typography>
  </Box>
);

export const TaskList = ({
  page,
  status,
  error,
  hasTasks,
  isFiltered,
  onPageChange,
  onClearFilters,
  onCreate,
  ...rowHandlers
}) => {
  const body = () => {
    if (status === "loading") return <TaskRowSkeleton rows={5} />;

    if (status === "failed") {
      return (
        <EmptyState
          icon={ErrorOutlineRoundedIcon}
          title="Could not load your tasks"
          description={error ?? "The API did not respond."}
        />
      );
    }

    if (!hasTasks) {
      return (
        <EmptyState
          icon={InboxRoundedIcon}
          title="Your board is empty"
          description="Capture the first one in plain language above, or add it with the full form."
          actionLabel="Add a task"
          onAction={onCreate}
        />
      );
    }

    if (page.items.length === 0) {
      return (
        <EmptyState
          icon={SearchOffRoundedIcon}
          title="No tasks match these filters"
          description="Try a different search term, or widen the status and priority filters."
          actionLabel="Clear filters"
          onAction={onClearFilters}
        />
      );
    }

    return page.items.map((task, index) => (
      <TaskRow
        key={task.id}
        task={task}
        isLast={index === page.items.length - 1}
        {...rowHandlers}
      />
    ));
  };

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Header total={page.total} shown={page.items.length} />
      {body()}
      {page.pageCount > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
            borderTop: `1px solid ${palette.border}`,
          }}
        >
          <Pagination
            size="small"
            count={page.pageCount}
            page={page.page}
            onChange={(_, value) => onPageChange(value)}
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
};

export default TaskList;

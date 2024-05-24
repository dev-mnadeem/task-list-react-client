import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import FilterBar from "modules/Tasks/FilterBar";
import QuickCapture from "modules/Tasks/QuickCapture";
import SummaryCards from "modules/Tasks/SummaryCards";
import TaskFormDialog from "modules/Tasks/TaskFormDialog";
import TaskList from "modules/Tasks/TaskList";
import { emptyTaskForm } from "modules/Tasks/taskFormSchema";
import {
  changeTaskStatus,
  clearQuery,
  createTask,
  deleteTask,
  fetchTasks,
  selectAllTasks,
  selectIsMutating,
  selectPage,
  selectQuery,
  selectSummary,
  selectTasksError,
  selectTasksStatus,
  setQuery,
  updateTask,
} from "store/tasksSlice";
import { defaultQuery } from "domain/taskQuery";

const CLOSED = { open: false, mode: "create", values: emptyTaskForm, id: null };

export const TaskBoard = () => {
  const dispatch = useDispatch();

  const allTasks = useSelector(selectAllTasks);
  const page = useSelector(selectPage);
  const query = useSelector(selectQuery);
  const status = useSelector(selectTasksStatus);
  const error = useSelector(selectTasksError);
  const mutating = useSelector(selectIsMutating);
  const summary = useSelector(selectSummary);

  const [dialog, setDialog] = useState(CLOSED);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const isFiltered = useMemo(
    () =>
      query.search !== defaultQuery.search ||
      query.status !== defaultQuery.status ||
      query.priority !== defaultQuery.priority,
    [query]
  );

  const openCreate = useCallback(
    (values = emptyTaskForm) =>
      setDialog({ open: true, mode: "create", values, id: null }),
    []
  );

  const openEdit = useCallback(
    (task) =>
      setDialog({
        open: true,
        mode: "edit",
        id: task.id,
        values: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          deadline: task.deadline,
        },
      }),
    []
  );

  const closeDialog = useCallback(() => setDialog(CLOSED), []);

  const handleSubmit = async (values) => {
    const input = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      deadline: values.deadline || null,
    };

    const action =
      dialog.mode === "edit" ? updateTask({ id: dialog.id, input }) : createTask(input);

    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(dialog.mode === "edit" ? "Task updated" : "Task added");
      closeDialog();
    } else {
      toast.error(result.payload ?? "Could not save the task");
    }
  };

  const handleStatusChange = async (task, next) => {
    const result = await dispatch(changeTaskStatus({ id: task.id, status: next }));
    if (result.meta.requestStatus !== "fulfilled") {
      toast.error(result.payload ?? "Could not update the status");
    }
  };

  const handleDelete = async (task) => {
    const result = await dispatch(deleteTask(task.id));
    if (result.meta.requestStatus === "fulfilled") toast.success("Task deleted");
    else toast.error(result.payload ?? "Could not delete the task");
  };

  /** A quick-capture draft opens the create dialog pre-filled, never saves blind. */
  const handleDraft = useCallback(
    (draft) =>
      openCreate({
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        deadline: draft.deadline,
      }),
    [openCreate]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
        <Typography variant="h1">Your board</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
          {summary.overdue > 0
            ? summary.overdue === 1
              ? "1 task is past its deadline."
              : `${summary.overdue} tasks are past their deadlines.`
            : "Nothing is past its deadline."}
        </Typography>
      </Box>

      <SummaryCards summary={summary} />

      <QuickCapture onDraft={handleDraft} />

      <FilterBar
        query={query}
        onChange={(patch) => dispatch(setQuery(patch))}
        onCreate={() => openCreate()}
      />

      <TaskList
        page={page}
        status={status}
        error={error}
        hasTasks={allTasks.length > 0}
        isFiltered={isFiltered}
        onPageChange={(value) => dispatch(setQuery({ page: value }))}
        onClearFilters={() => dispatch(clearQuery())}
        onCreate={() => openCreate()}
        onEdit={openEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      <TaskFormDialog
        open={dialog.open}
        mode={dialog.mode}
        initialValues={dialog.values}
        submitting={mutating}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default TaskBoard;

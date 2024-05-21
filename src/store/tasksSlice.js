import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";

import config from "config";
import { applyQuery, defaultQuery, paginate, summarise } from "domain/taskQuery";
import { describeError } from "services/http/httpClient";
import { resolveTaskRepository } from "services/tasks";

const withRepository = (handler) => async (arg, thunkApi) => {
  try {
    return await handler(resolveTaskRepository(), arg, thunkApi);
  } catch (error) {
    return thunkApi.rejectWithValue(describeError(error));
  }
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  withRepository((repository) => repository.list())
);

export const createTask = createAsyncThunk(
  "tasks/create",
  withRepository((repository, input) => repository.create(input))
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  withRepository((repository, { id, input }) => repository.update(id, input))
);

export const changeTaskStatus = createAsyncThunk(
  "tasks/changeStatus",
  withRepository((repository, { id, status }) => repository.updateStatus(id, status))
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  withRepository(async (repository, id) => {
    await repository.remove(id);
    return id;
  })
);

export const resetDemoTasks = createAsyncThunk(
  "tasks/resetDemo",
  withRepository((repository) => repository.reset())
);

const initialState = {
  items: [],
  status: "idle", // idle | loading | ready | failed
  error: null,
  /** Id of the task currently loaded into the form, or null. */
  editingId: null,
  mutating: false,
  query: { ...defaultQuery },
};

const upsert = (state, task) => {
  if (!task) return;
  const index = state.items.findIndex((item) => item.id === task.id);
  if (index === -1) state.items.unshift(task);
  else state.items[index] = task;
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setQuery(state, action) {
      // Any change to the filters returns to the first page.
      const resetsPage = !("page" in action.payload);
      state.query = {
        ...state.query,
        ...action.payload,
        ...(resetsPage ? { page: 1 } : {}),
      };
    },
    clearQuery(state) {
      state.query = { ...defaultQuery };
    },
    startEditing(state, action) {
      state.editingId = action.payload;
    },
    stopEditing(state) {
      state.editingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load tasks.";
        state.items = [];
      })
      .addCase(resetDemoTasks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
        state.editingId = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
        if (state.editingId === action.payload) state.editingId = null;
      })
      .addMatcher(
        (action) =>
          [createTask.fulfilled, updateTask.fulfilled, changeTaskStatus.fulfilled]
            .map((thunk) => thunk.type)
            .includes(action.type),
        (state, action) => {
          upsert(state, action.payload);
          state.mutating = false;
          state.editingId = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("tasks/") && action.type.endsWith("/pending"),
        (state, action) => {
          if (action.type !== fetchTasks.pending.type) state.mutating = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("tasks/") && action.type.endsWith("/rejected"),
        (state) => {
          state.mutating = false;
        }
      );
  },
});

export const { setQuery, clearQuery, startEditing, stopEditing } = tasksSlice.actions;

const selectTasksState = (state) => state.tasks;

export const selectAllTasks = (state) => selectTasksState(state).items;
export const selectQuery = (state) => selectTasksState(state).query;
export const selectTasksStatus = (state) => selectTasksState(state).status;
export const selectTasksError = (state) => selectTasksState(state).error;
export const selectIsMutating = (state) => selectTasksState(state).mutating;

/**
 * Filtering and sorting run once per (tasks, query) pair rather than on every
 * render of every row — the list re-renders on each keystroke in the search box.
 */
export const selectVisibleTasks = createSelector(
  [selectAllTasks, selectQuery],
  (tasks, query) => applyQuery(tasks, query)
);

export const selectPage = createSelector(
  [selectVisibleTasks, selectQuery],
  (tasks, query) => paginate(tasks, query.page, config.ui.pageSize)
);

export const selectSummary = createSelector([selectAllTasks], (tasks) =>
  summarise(tasks)
);

export const selectEditingTask = createSelector(
  [selectAllTasks, (state) => selectTasksState(state).editingId],
  (tasks, editingId) =>
    editingId ? (tasks.find((task) => task.id === editingId) ?? null) : null
);

export default tasksSlice.reducer;

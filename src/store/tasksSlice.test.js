import { configureStore } from "@reduxjs/toolkit";

import { TaskPriority, TaskStatus } from "domain/task";
import { setTaskRepository } from "services/tasks";
import tasksReducer, {
  changeTaskStatus,
  clearQuery,
  createTask,
  deleteTask,
  fetchTasks,
  selectPage,
  selectSummary,
  selectVisibleTasks,
  setQuery,
} from "store/tasksSlice";

const seed = [
  {
    id: "1",
    title: "Alpha",
    description: "",
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    deadline: "2030-01-01",
    createdAt: null,
  },
  {
    id: "2",
    title: "Beta",
    description: "",
    priority: TaskPriority.LOW,
    status: TaskStatus.COMPLETED,
    deadline: "2030-02-01",
    createdAt: null,
  },
];

const stubRepository = (overrides = {}) => ({
  list: jest.fn(async () => seed.map((task) => ({ ...task }))),
  get: jest.fn(async (id) => seed.find((task) => task.id === id)),
  create: jest.fn(async (input) => ({ ...seed[0], ...input, id: "99" })),
  update: jest.fn(async (id, input) => ({ ...seed[0], ...input, id })),
  updateStatus: jest.fn(async (id, status) => ({ ...seed[0], id, status })),
  remove: jest.fn(async () => undefined),
  ...overrides,
});

const makeStore = () => configureStore({ reducer: { tasks: tasksReducer } });

afterEach(() => setTaskRepository(null));

describe("fetchTasks", () => {
  it("moves idle -> loading -> ready and stores the tasks", async () => {
    setTaskRepository(stubRepository());
    const store = makeStore();

    expect(store.getState().tasks.status).toBe("idle");
    const pending = store.dispatch(fetchTasks());
    expect(store.getState().tasks.status).toBe("loading");

    await pending;
    expect(store.getState().tasks.status).toBe("ready");
    expect(store.getState().tasks.items).toHaveLength(2);
  });

  it("records the error message and empties the list on failure", async () => {
    setTaskRepository(
      stubRepository({
        list: jest.fn(async () => {
          const error = new Error("boom");
          error.response = { data: { message: "The API is down" } };
          throw error;
        }),
      })
    );
    const store = makeStore();

    await store.dispatch(fetchTasks());

    expect(store.getState().tasks.status).toBe("failed");
    expect(store.getState().tasks.error).toBe("The API is down");
    expect(store.getState().tasks.items).toEqual([]);
  });
});

describe("mutations", () => {
  it("puts a created task at the top of the list", async () => {
    setTaskRepository(stubRepository());
    const store = makeStore();
    await store.dispatch(fetchTasks());

    await store.dispatch(createTask({ title: "Fresh", priority: TaskPriority.LOW }));

    expect(store.getState().tasks.items[0].id).toBe("99");
    expect(store.getState().tasks.items).toHaveLength(3);
  });

  it("replaces a task in place on a status change rather than appending", async () => {
    setTaskRepository(stubRepository());
    const store = makeStore();
    await store.dispatch(fetchTasks());

    await store.dispatch(changeTaskStatus({ id: "1", status: TaskStatus.COMPLETED }));

    const items = store.getState().tasks.items;
    expect(items).toHaveLength(2);
    expect(items.find((task) => task.id === "1").status).toBe(TaskStatus.COMPLETED);
  });

  it("removes a deleted task from the list", async () => {
    setTaskRepository(stubRepository());
    const store = makeStore();
    await store.dispatch(fetchTasks());

    await store.dispatch(deleteTask("1"));

    expect(store.getState().tasks.items.map((task) => task.id)).toEqual(["2"]);
  });

  it("clears the mutating flag when a mutation fails", async () => {
    setTaskRepository(
      stubRepository({
        create: jest.fn(async () => {
          throw new Error("nope");
        }),
      })
    );
    const store = makeStore();

    await store.dispatch(createTask({ title: "x" }));

    expect(store.getState().tasks.mutating).toBe(false);
  });
});

describe("query state", () => {
  it("returns to page one whenever a filter changes", async () => {
    const store = makeStore();
    store.dispatch(setQuery({ page: 3 }));
    expect(store.getState().tasks.query.page).toBe(3);

    store.dispatch(setQuery({ search: "alpha" }));
    expect(store.getState().tasks.query.page).toBe(1);
  });

  it("keeps the page when only the page changes", () => {
    const store = makeStore();
    store.dispatch(setQuery({ page: 2 }));
    expect(store.getState().tasks.query.page).toBe(2);
  });

  it("clearQuery restores every default", () => {
    const store = makeStore();
    store.dispatch(setQuery({ search: "x", status: TaskStatus.COMPLETED }));
    store.dispatch(clearQuery());
    expect(store.getState().tasks.query).toMatchObject({ search: "", status: "all" });
  });
});

describe("selectors", () => {
  it("filters the visible list and summarises the whole one", async () => {
    setTaskRepository(stubRepository());
    const store = makeStore();
    await store.dispatch(fetchTasks());
    store.dispatch(setQuery({ status: TaskStatus.COMPLETED }));

    expect(selectVisibleTasks(store.getState())).toHaveLength(1);
    expect(selectSummary(store.getState()).total).toBe(2);
    expect(selectPage(store.getState())).toMatchObject({ page: 1, total: 1 });
  });
});

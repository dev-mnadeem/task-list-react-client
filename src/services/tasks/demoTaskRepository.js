import { normaliseTask, normaliseTasks, TaskStatus } from "domain/task";
import { buildSeedTasks } from "services/tasks/demoSeed";

const STORAGE_KEY = "demo:tasks";

/** Enough latency that the loading state is a real state, not a flicker. */
const SIMULATED_LATENCY_MS = 220;

const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const readAll = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normaliseTasks(parsed) : null;
  } catch {
    return null;
  }
};

const writeAll = (tasks) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* Quota or private mode: the in-memory copy still serves this session. */
  }
};

/**
 * A task repository that never leaves the browser.
 *
 * This is what makes the app runnable — and screenshottable — with no backend:
 * a fresh clone with no `REACT_APP_API_BASE_URL` boots straight into a seeded
 * board. State survives a reload through localStorage and `reset()` puts the
 * seed back.
 */
export const createDemoTaskRepository = ({ latencyMs } = {}) => {
  let tasks = readAll();
  if (!tasks) {
    tasks = normaliseTasks(buildSeedTasks());
    writeAll(tasks);
  }

  let nextId = tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0) + 1;

  const pause = () => delay(latencyMs ?? SIMULATED_LATENCY_MS);

  const find = (id) => tasks.find((task) => task.id === String(id));

  const commit = () => writeAll(tasks);

  return {
    async list() {
      await pause();
      return tasks.map((task) => ({ ...task }));
    },

    async get(id) {
      await pause();
      const task = find(id);
      if (!task) throw new Error(`No task with id ${id}`);
      return { ...task };
    },

    async create(input) {
      await pause();
      const task = normaliseTask({
        ...input,
        id: String(nextId++),
        status: input.status ?? TaskStatus.PENDING,
        createdAt: new Date().toISOString(),
      });
      tasks = [task, ...tasks];
      commit();
      return { ...task };
    },

    async update(id, input) {
      await pause();
      const existing = find(id);
      if (!existing) throw new Error(`No task with id ${id}`);
      const updated = normaliseTask({ ...existing, ...input, id: existing.id });
      tasks = tasks.map((task) => (task.id === updated.id ? updated : task));
      commit();
      return { ...updated };
    },

    async updateStatus(id, status) {
      return this.update(id, { status });
    },

    async remove(id) {
      await pause();
      tasks = tasks.filter((task) => task.id !== String(id));
      commit();
    },

    /** Demo-only escape hatch, surfaced as a button in the demo banner. */
    async reset() {
      tasks = normaliseTasks(buildSeedTasks());
      nextId = tasks.length + 1;
      commit();
      return tasks.map((task) => ({ ...task }));
    },
  };
};

export default createDemoTaskRepository;

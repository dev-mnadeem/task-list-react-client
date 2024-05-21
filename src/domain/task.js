/**
 * The task vocabulary, in one place.
 *
 * The REST API is asymmetric: it *returns* statuses as snake_case strings and
 * *accepts* them as small integers. That asymmetry used to be spelled out as
 * bare `0` / `1` / `2` at three call sites. It is encoded here instead.
 */

export const TaskStatus = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});

export const TASK_STATUSES = Object.freeze([
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
]);

/** Wire format expected by `PATCH /api/v1/tasks/:id`. */
const STATUS_TO_CODE = Object.freeze({
  [TaskStatus.PENDING]: 0,
  [TaskStatus.IN_PROGRESS]: 1,
  [TaskStatus.COMPLETED]: 2,
});

const STATUS_LABELS = Object.freeze({
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In progress",
  [TaskStatus.COMPLETED]: "Completed",
});

export const TaskPriority = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

export const TASK_PRIORITIES = Object.freeze([
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
]);

/** Higher sorts first when ordering by priority. */
const PRIORITY_WEIGHT = Object.freeze({
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1,
});

export const statusToCode = (status) =>
  STATUS_TO_CODE[status] ?? STATUS_TO_CODE[TaskStatus.PENDING];

export const statusLabel = (status) => STATUS_LABELS[status] ?? "Unknown";

export const priorityLabel = (priority) =>
  priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "—";

export const priorityWeight = (priority) => PRIORITY_WEIGHT[priority] ?? 0;

export const isValidStatus = (status) => TASK_STATUSES.includes(status);

export const isValidPriority = (priority) => TASK_PRIORITIES.includes(priority);

/**
 * Coerce whatever a repository hands back into one shape the UI can rely on.
 *
 * The HTTP API wraps every record as `{ id, attributes: { ... } }` while the
 * demo repository stores flat objects. Both go through here so no component has
 * to know which one it is talking to.
 */
export const normaliseTask = (raw) => {
  if (!raw) return null;
  const source = raw.attributes ?? raw;
  const id = source.id ?? raw.id;
  if (id === undefined || id === null) return null;

  const status = isValidStatus(source.status) ? source.status : TaskStatus.PENDING;
  const priority = isValidPriority(source.priority)
    ? source.priority
    : TaskPriority.LOW;

  return {
    id: String(id),
    title: source.title ?? "",
    description: source.description ?? "",
    priority,
    status,
    deadline: source.deadline ?? null,
    createdAt: source.created_at ?? source.createdAt ?? null,
  };
};

export const normaliseTasks = (list) =>
  (Array.isArray(list) ? list : []).map(normaliseTask).filter(Boolean);

/** A task is overdue when it has a past deadline and is not finished. */
export const isOverdue = (task, now = new Date()) => {
  if (!task?.deadline || task.status === TaskStatus.COMPLETED) return false;
  const due = new Date(task.deadline);
  if (Number.isNaN(due.getTime())) return false;
  const endOfDue = new Date(due);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue.getTime() < now.getTime();
};

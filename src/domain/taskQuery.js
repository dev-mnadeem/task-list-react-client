import { isOverdue, priorityWeight, TaskStatus } from "domain/task";

export const SortOrder = Object.freeze({
  DEADLINE: "deadline",
  PRIORITY: "priority",
  TITLE: "title",
});

export const ALL = "all";

export const defaultQuery = Object.freeze({
  search: "",
  status: ALL,
  priority: ALL,
  sort: SortOrder.DEADLINE,
  page: 1,
});

const matchesSearch = (task, needle) => {
  if (!needle) return true;
  const term = needle.trim().toLowerCase();
  if (!term) return true;
  return (
    task.title.toLowerCase().includes(term) ||
    task.description.toLowerCase().includes(term)
  );
};

const timestamp = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

/** Finished work sinks below unfinished work in every ordering. */
const doneLast = (a, b) =>
  Number(a.status === TaskStatus.COMPLETED) - Number(b.status === TaskStatus.COMPLETED);

const then = (first, second) => (a, b) => first(a, b) || second(a, b);

const comparators = {
  [SortOrder.DEADLINE]: then(
    doneLast,
    (a, b) => timestamp(a.deadline) - timestamp(b.deadline)
  ),
  [SortOrder.PRIORITY]: then(
    doneLast,
    (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)
  ),
  [SortOrder.TITLE]: then(doneLast, (a, b) => a.title.localeCompare(b.title)),
};

/** Filter then sort. Pure: callers memoise the result. */
export const applyQuery = (tasks, query = defaultQuery) => {
  const { search, status, priority, sort } = { ...defaultQuery, ...query };
  const compare = comparators[sort] ?? comparators[SortOrder.DEADLINE];

  return tasks
    .filter(
      (task) =>
        (status === ALL || task.status === status) &&
        (priority === ALL || task.priority === priority) &&
        matchesSearch(task, search)
    )
    .sort(compare);
};

/**
 * Slice a filtered list into a page. The list is client-side today because the
 * API returns every task in one response; keeping paging behind this function
 * means moving it server-side later is a change in one place.
 */
export const paginate = (tasks, page, pageSize) => {
  const safeSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(tasks.length / safeSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * safeSize;
  return {
    items: tasks.slice(start, start + safeSize),
    page: safePage,
    pageCount,
    total: tasks.length,
  };
};

export const summarise = (tasks, now = new Date()) => {
  const counts = {
    total: tasks.length,
    [TaskStatus.PENDING]: 0,
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.COMPLETED]: 0,
    overdue: 0,
  };

  for (const task of tasks) {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
    if (isOverdue(task, now)) counts.overdue += 1;
  }
  return counts;
};

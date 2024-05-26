import { TaskPriority, TaskStatus } from "domain/task";
import {
  ALL,
  applyQuery,
  defaultQuery,
  paginate,
  SortOrder,
  summarise,
} from "domain/taskQuery";

const task = (overrides) => ({
  id: "1",
  title: "Task",
  description: "",
  priority: TaskPriority.LOW,
  status: TaskStatus.PENDING,
  deadline: null,
  ...overrides,
});

const tasks = [
  task({ id: "1", title: "Alpha", priority: TaskPriority.LOW, deadline: "2030-03-01" }),
  task({
    id: "2",
    title: "Beta",
    description: "mentions kubernetes",
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    deadline: "2030-01-01",
  }),
  task({
    id: "3",
    title: "Gamma",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.COMPLETED,
    deadline: null,
  }),
];

describe("applyQuery", () => {
  it("sorts by deadline by default and puts undated tasks last", () => {
    const ids = applyQuery(tasks, defaultQuery).map((item) => item.id);
    expect(ids).toEqual(["2", "1", "3"]);
  });

  it("sorts by priority, highest first, with completed work last", () => {
    // Gamma is medium but completed, so it sinks below low-priority Alpha.
    const ids = applyQuery(tasks, { sort: SortOrder.PRIORITY }).map((item) => item.id);
    expect(ids).toEqual(["2", "1", "3"]);
  });

  it("keeps completed tasks at the bottom of every ordering", () => {
    const done = task({
      id: "0",
      title: "Aaa",
      status: TaskStatus.COMPLETED,
      deadline: "2029-01-01",
    });
    const ordered = applyQuery([done, ...tasks], { sort: SortOrder.TITLE });
    expect(ordered[ordered.length - 1].id).toBe("3");
    expect(ordered.map((item) => item.id)).toEqual(["1", "2", "0", "3"]);
  });

  it("sorts by title alphabetically", () => {
    const ids = applyQuery(tasks, { sort: SortOrder.TITLE }).map((item) => item.id);
    expect(ids).toEqual(["1", "2", "3"]);
  });

  it("filters by status and by priority", () => {
    expect(applyQuery(tasks, { status: TaskStatus.COMPLETED })).toHaveLength(1);
    expect(applyQuery(tasks, { priority: TaskPriority.HIGH })).toHaveLength(1);
    expect(applyQuery(tasks, { status: ALL, priority: ALL })).toHaveLength(3);
  });

  it("searches titles and descriptions case-insensitively", () => {
    expect(applyQuery(tasks, { search: "KUBERNET" })).toHaveLength(1);
    expect(applyQuery(tasks, { search: "  gam " })).toHaveLength(1);
    expect(applyQuery(tasks, { search: "   " })).toHaveLength(3);
  });

  it("does not mutate the array it was given", () => {
    const input = [...tasks];
    applyQuery(input, { sort: SortOrder.TITLE });
    expect(input.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });
});

describe("paginate", () => {
  const many = Array.from({ length: 11 }, (_, index) => task({ id: String(index) }));

  it("slices the requested page", () => {
    const result = paginate(many, 2, 4);
    expect(result.items.map((item) => item.id)).toEqual(["4", "5", "6", "7"]);
    expect(result.pageCount).toBe(3);
    expect(result.total).toBe(11);
  });

  it("clamps a page number past the end back to the last page", () => {
    expect(paginate(many, 99, 4).page).toBe(3);
    expect(paginate(many, 0, 4).page).toBe(1);
  });

  it("reports one empty page for an empty list", () => {
    const result = paginate([], 1, 8);
    expect(result).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});

describe("summarise", () => {
  it("counts each status and the overdue tasks", () => {
    const now = new Date("2030-02-01T00:00:00Z");
    const counts = summarise(tasks, now);
    expect(counts.total).toBe(3);
    expect(counts[TaskStatus.PENDING]).toBe(1);
    expect(counts[TaskStatus.IN_PROGRESS]).toBe(1);
    expect(counts[TaskStatus.COMPLETED]).toBe(1);
    expect(counts.overdue).toBe(1);
  });
});

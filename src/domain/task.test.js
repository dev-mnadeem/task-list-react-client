import {
  isOverdue,
  normaliseTask,
  normaliseTasks,
  priorityLabel,
  priorityWeight,
  statusLabel,
  statusToCode,
  TaskPriority,
  TaskStatus,
} from "domain/task";

describe("normaliseTask", () => {
  it("unwraps the JSON:API attributes envelope the REST API returns", () => {
    const task = normaliseTask({
      id: 7,
      attributes: {
        id: 7,
        title: "Renew certificate",
        description: "staging.internal",
        priority: "high",
        status: "in_progress",
        deadline: "2030-01-05",
        created_at: "2029-12-01T10:00:00Z",
      },
    });

    expect(task).toEqual({
      id: "7",
      title: "Renew certificate",
      description: "staging.internal",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      deadline: "2030-01-05",
      createdAt: "2029-12-01T10:00:00Z",
    });
  });

  it("accepts the flat rows the demo repository stores", () => {
    const task = normaliseTask({ id: "3", title: "Flat", status: "completed" });
    expect(task.id).toBe("3");
    expect(task.status).toBe(TaskStatus.COMPLETED);
    expect(task.description).toBe("");
  });

  it("falls back to pending/low when the server sends an unknown value", () => {
    const task = normaliseTask({ id: 1, status: "banana", priority: "nuclear" });
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.priority).toBe(TaskPriority.LOW);
  });

  it("drops rows with no id instead of producing an unkeyed task", () => {
    expect(normaliseTask({ title: "no id" })).toBeNull();
    expect(normaliseTask(null)).toBeNull();
    expect(normaliseTasks([{ id: 1 }, { title: "x" }, null])).toHaveLength(1);
    expect(normaliseTasks(undefined)).toEqual([]);
  });
});

describe("status and priority vocabulary", () => {
  it("maps statuses to the integer codes the PATCH endpoint expects", () => {
    expect(statusToCode(TaskStatus.PENDING)).toBe(0);
    expect(statusToCode(TaskStatus.IN_PROGRESS)).toBe(1);
    expect(statusToCode(TaskStatus.COMPLETED)).toBe(2);
    expect(statusToCode("nonsense")).toBe(0);
  });

  it("labels statuses and priorities for display", () => {
    expect(statusLabel(TaskStatus.IN_PROGRESS)).toBe("In progress");
    expect(statusLabel("nope")).toBe("Unknown");
    expect(priorityLabel(TaskPriority.HIGH)).toBe("High");
    expect(priorityLabel(null)).toBe("—");
  });

  it("orders priorities high above medium above low", () => {
    expect(priorityWeight(TaskPriority.HIGH)).toBeGreaterThan(
      priorityWeight(TaskPriority.MEDIUM)
    );
    expect(priorityWeight(TaskPriority.MEDIUM)).toBeGreaterThan(
      priorityWeight(TaskPriority.LOW)
    );
    expect(priorityWeight(undefined)).toBe(0);
  });
});

describe("isOverdue", () => {
  const now = new Date("2030-06-15T12:00:00Z");

  it("is true for an unfinished task whose deadline has passed", () => {
    expect(isOverdue({ deadline: "2030-06-14", status: TaskStatus.PENDING }, now)).toBe(
      true
    );
  });

  it("treats the deadline day itself as still in time", () => {
    expect(isOverdue({ deadline: "2030-06-15", status: TaskStatus.PENDING }, now)).toBe(
      false
    );
  });

  it("is never true for a completed task", () => {
    expect(
      isOverdue({ deadline: "2029-01-01", status: TaskStatus.COMPLETED }, now)
    ).toBe(false);
  });

  it("is false when there is no deadline or it does not parse", () => {
    expect(isOverdue({ deadline: null, status: TaskStatus.PENDING }, now)).toBe(false);
    expect(isOverdue({ deadline: "not-a-date", status: TaskStatus.PENDING }, now)).toBe(
      false
    );
    expect(isOverdue(null, now)).toBe(false);
  });
});

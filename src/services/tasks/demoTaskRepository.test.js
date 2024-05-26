import { TaskPriority, TaskStatus } from "domain/task";
import createDemoTaskRepository from "services/tasks/demoTaskRepository";
import { assertTaskRepository } from "services/tasks/taskRepository";

const build = () => createDemoTaskRepository({ latencyMs: 0 });

beforeEach(() => window.localStorage.clear());

describe("demoTaskRepository", () => {
  it("satisfies the task repository contract", () => {
    expect(() => assertTaskRepository(build())).not.toThrow();
  });

  it("seeds a board on first use", async () => {
    const tasks = await build().list();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty("title");
    expect(tasks.every((task) => typeof task.id === "string")).toBe(true);
  });

  it("creates a task with a fresh id and pending status", async () => {
    const repository = build();
    const before = await repository.list();

    const created = await repository.create({
      title: "Book the venue",
      description: "Before prices go up",
      priority: TaskPriority.HIGH,
      deadline: "2030-04-01",
    });

    expect(created.title).toBe("Book the venue");
    expect(created.status).toBe(TaskStatus.PENDING);
    expect(before.map((task) => task.id)).not.toContain(created.id);
    await expect(repository.list()).resolves.toHaveLength(before.length + 1);
  });

  it("updates a task in place", async () => {
    const repository = build();
    const [first] = await repository.list();

    const updated = await repository.update(first.id, { title: "Renamed" });

    expect(updated.id).toBe(first.id);
    expect(updated.title).toBe("Renamed");
    const list = await repository.list();
    expect(list.find((task) => task.id === first.id).title).toBe("Renamed");
  });

  it("moves a task between statuses", async () => {
    const repository = build();
    const [first] = await repository.list();

    const updated = await repository.updateStatus(first.id, TaskStatus.COMPLETED);

    expect(updated.status).toBe(TaskStatus.COMPLETED);
  });

  it("deletes a task", async () => {
    const repository = build();
    const [first, ...rest] = await repository.list();

    await repository.remove(first.id);

    const remaining = await repository.list();
    expect(remaining.map((task) => task.id)).toEqual(rest.map((task) => task.id));
  });

  it("rejects an update or a read for an id that does not exist", async () => {
    const repository = build();
    await expect(repository.get("nope")).rejects.toThrow(/No task with id/);
    await expect(repository.update("nope", {})).rejects.toThrow(/No task with id/);
  });

  it("persists across instances through localStorage", async () => {
    const first = build();
    await first.create({ title: "Survives a reload", priority: TaskPriority.LOW });

    const second = build();
    const titles = (await second.list()).map((task) => task.title);
    expect(titles).toContain("Survives a reload");
  });

  it("restores the seed on reset", async () => {
    const repository = build();
    const seeded = await repository.list();
    await repository.remove(seeded[0].id);
    await repository.remove(seeded[1].id);

    const reset = await repository.reset();

    expect(reset).toHaveLength(seeded.length);
  });
});

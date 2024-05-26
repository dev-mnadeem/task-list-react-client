import { assertTaskRepository, REQUIRED_METHODS } from "services/tasks/taskRepository";
import apiTaskRepository from "services/tasks/apiTaskRepository";

describe("assertTaskRepository", () => {
  it("accepts the HTTP repository", () => {
    expect(() => assertTaskRepository(apiTaskRepository)).not.toThrow();
  });

  it("names every missing method so the failure is actionable", () => {
    expect(() => assertTaskRepository({ list: () => {} }, "stub")).toThrow(
      /stub is not a task repository: missing get, create, update, updateStatus, remove/
    );
  });

  it("rejects a non-object", () => {
    expect(() => assertTaskRepository(null)).toThrow(TypeError);
  });

  it("requires exactly the six documented methods", () => {
    expect(REQUIRED_METHODS).toEqual([
      "list",
      "get",
      "create",
      "update",
      "updateStatus",
      "remove",
    ]);
  });
});

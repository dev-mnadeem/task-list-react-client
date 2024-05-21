import { setupServer } from "msw/node";

import config from "config";
import { TaskStatus } from "domain/task";
import { createTaskApi, MOCK_API_URL } from "mocks/taskApi";
import authRepository from "services/auth";
import {
  describeError,
  readToken,
  setUnauthorizedHandler,
} from "services/http/httpClient";
import { resolveTaskRepository } from "services/tasks";

// Point config at the mock API before any module reads it.
vi.hoisted(() => vi.stubEnv("VITE_API_BASE_URL", "http://api.test"));

let api;
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(async () => {
  window.localStorage.clear();
  api = createTaskApi();
  server.resetHandlers(...api.handlers);
  await authRepository
    .signIn({ email: "robin@example.com", password: "correct-horse" })
    .then(({ token }) => window.localStorage.setItem("authToken", token));
});
afterAll(() => server.close());

const repository = () => resolveTaskRepository();

describe("apiTaskRepository against the Rails contract", () => {
  it("runs against the API, not demo mode, once a base URL is configured", () => {
    expect(config).toMatchObject({ apiBaseUrl: MOCK_API_URL, demoMode: false });
    expect(api.requests[0]).toMatchObject({ method: "POST", path: "/login" });
  });

  it("unwraps the JSON:API list and maps 'In progress'", async () => {
    const tasks = await repository().list();

    expect(tasks.map((task) => task.title)).toEqual([
      "Order new desk chairs",
      "Draft the sprint notes",
    ]);
    expect(tasks[1]).toMatchObject({ id: "1", status: TaskStatus.IN_PROGRESS });
    expect(api.requests.at(-1).authorization).toMatch(/^Bearer mock-session-/);
  });

  it("wraps a new task under `task` and gets the created record back", async () => {
    const created = await repository().create({
      title: "Book the venue",
      description: "Forty people, step-free access.",
      priority: "medium",
      deadline: "2030-04-01",
    });

    expect(api.requests.at(-1).body).toEqual({
      task: {
        title: "Book the venue",
        description: "Forty people, step-free access.",
        priority: "medium",
        deadline: "2030-04-01",
      },
    });
    expect(created).toMatchObject({ id: "3", status: TaskStatus.PENDING });
  });

  it("sends a status change as the integer the API accepts", async () => {
    const updated = await repository().updateStatus("2", TaskStatus.IN_PROGRESS);

    expect(api.requests.at(-1).body).toEqual({ task: { status: 1 } });
    expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
    expect(api.tasks.find((task) => task.id === 2).status).toBe("In progress");
  });

  it("turns the API's validation errors into one readable message", async () => {
    const error = await repository()
      .create({ title: "Tidy", description: "", priority: "low", deadline: null })
      .catch((caught) => caught);

    expect(error.response.status).toBe(422);
    expect(describeError(error)).toBe(
      "Description can't be blank, Deadline can't be blank"
    );
  });

  it("deletes a task and reports the API's 404 message for a missing one", async () => {
    await repository().remove("1");
    expect(api.tasks.map((task) => task.id)).toEqual([2]);

    const error = await repository()
      .remove("1")
      .catch((caught) => caught);
    expect(describeError(error)).toBe("Record(s) not found: Task");
  });
});

describe("an expired session", () => {
  it("clears the stored token and notifies the store once", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    api.tokens.clear();

    const error = await repository()
      .list()
      .catch((caught) => caught);

    expect(error.response.status).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(readToken()).toBeNull();
    setUnauthorizedHandler(null);
  });
});

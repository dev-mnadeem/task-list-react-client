import { http, HttpResponse } from "msw";

/**
 * An in-memory stand-in for the Rails task API (to_do_app_backend), built from
 * its controllers and serializers rather than from what this client assumes:
 *
 * - records come back JSON:API style, `{ data: { id, type, attributes } }`;
 * - status is serialised by enum key, so 1 is "In progress", and is written
 *   as the integer;
 * - a task needs a title (30 characters at most), a description and a
 *   deadline, and a failed save is `422 { errors: [...] }`;
 * - Devise puts the session token in the `Authorization` response header and
 *   answers an unauthenticated request with `401 { error }`.
 */

const STATUS_KEYS = ["pending", "In progress", "completed"];
const PRIORITIES = ["low", "medium", "high"];

export const MOCK_API_URL = "http://api.test";

export const mockSeed = () => [
  {
    id: 1,
    title: "Draft the sprint notes",
    description: "Pull the open questions from Monday's stand-up.",
    status: "In progress",
    priority: "high",
    deadline: "2030-03-02",
  },
  {
    id: 2,
    title: "Order new desk chairs",
    description: "Two for the design corner.",
    status: "pending",
    priority: "low",
    deadline: "2030-03-20",
  },
];

/**
 * The client runs on another origin, so like the real API (rack-cors) the mock
 * must answer preflights and expose `Authorization`, or the browser hides the
 * session token from the client.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "Authorization",
};

const json = (body, init = {}) =>
  HttpResponse.json(body, { ...init, headers: { ...CORS_HEADERS, ...init.headers } });

const serialiseUser = (user) => ({
  data: { id: String(user.id), type: "user", attributes: user },
});

const serialiseTask = (task) => ({
  id: String(task.id),
  type: "task",
  attributes: { ...task },
});

const validate = (task) => {
  const errors = [];
  if (!task.title) errors.push("Title can't be blank");
  else if (task.title.length > 30)
    errors.push("Title is too long (maximum is 30 characters)");
  if (!task.description) errors.push("Description can't be blank");
  if (!task.deadline) errors.push("Deadline can't be blank");
  return errors;
};

const applyInput = (task, input = {}) => {
  const next = { ...task };
  for (const key of ["title", "description", "deadline"]) {
    if (key in input) next[key] = input[key];
  }
  if ("priority" in input) {
    if (!PRIORITIES.includes(input.priority)) {
      throw new Error(`'${input.priority}' is not a valid priority`);
    }
    next.priority = input.priority;
  }
  if ("status" in input) {
    const key = STATUS_KEYS[input.status];
    if (key === undefined) throw new Error(`'${input.status}' is not a valid status`);
    next.status = key;
  }
  return next;
};

/**
 * Handlers plus the state behind them, so a test can inspect what the client
 * sent (`api.requests`) and what the server now holds (`api.tasks`).
 */
export const createTaskApi = ({ baseUrl = MOCK_API_URL, tasks = mockSeed() } = {}) => {
  const api = {
    tasks: tasks.map((task) => ({ ...task })),
    requests: [],
    tokens: new Set(),
  };
  let nextId = Math.max(0, ...api.tasks.map((task) => task.id)) + 1;
  let nextToken = 1;
  const url = (path) => `${baseUrl}${path}`;

  const record = async (request) => {
    const body = ["POST", "PATCH"].includes(request.method)
      ? await request.clone().json()
      : undefined;
    api.requests.push({
      method: request.method,
      path: new URL(request.url).pathname,
      authorization: request.headers.get("Authorization"),
      body,
    });
    return body;
  };

  const issueSession = (user) => {
    const token = `Bearer mock-session-${nextToken++}`;
    api.tokens.add(token);
    return json(serialiseUser(user), {
      headers: { Authorization: token },
    });
  };

  const unauthorised = () =>
    json(
      { error: "You need to sign in or sign up before continuing." },
      { status: 401 }
    );

  const authed = (handler) => async (context) => {
    await record(context.request);
    if (!api.tokens.has(context.request.headers.get("Authorization"))) {
      return unauthorised();
    }
    return handler(context, api.requests.at(-1).body);
  };

  const find = (id) => api.tasks.find((task) => String(task.id) === String(id));
  const notFound = () =>
    json({ message: "Record(s) not found: Task" }, { status: 404 });

  api.handlers = [
    http.options(
      url("/*"),
      () => new HttpResponse(null, { status: 204, headers: CORS_HEADERS })
    ),

    http.post(url("/login"), async ({ request }) => {
      const { user } = await record(request);
      if (user?.password !== "correct-horse") {
        return json({ error: "Invalid Email or password." }, { status: 401 });
      }
      return issueSession({
        id: 1,
        first_name: "Robin",
        last_name: "Park",
        email: user.email,
      });
    }),

    http.post(url("/sign_up"), async ({ request }) => {
      const { user } = await record(request);
      return issueSession({
        id: 2,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }),

    http.delete(url("/logout"), async ({ request }) => {
      await record(request);
      api.tokens.delete(request.headers.get("Authorization"));
      return json({ status: 200, message: "logged out successfully" });
    }),

    http.get(
      url("/api/v1/tasks"),
      authed(() => json({ data: [...api.tasks].reverse().map(serialiseTask) }))
    ),

    http.get(
      url("/api/v1/tasks/:id"),
      authed(({ params }) => {
        const task = find(params.id);
        return task ? json({ data: serialiseTask(task) }) : notFound();
      })
    ),

    http.post(
      url("/api/v1/tasks"),
      authed((_, body) => {
        let task;
        try {
          task = applyInput(
            { id: nextId, status: "pending", priority: "low" },
            body?.task
          );
        } catch (error) {
          return json({ message: error.message }, { status: 422 });
        }
        const errors = validate(task);
        if (errors.length) return json({ errors }, { status: 422 });
        nextId += 1;
        api.tasks.push(task);
        return json({ data: serialiseTask(task) }, { status: 201 });
      })
    ),

    http.patch(
      url("/api/v1/tasks/:id"),
      authed(({ params }, body) => {
        const task = find(params.id);
        if (!task) return notFound();
        let updated;
        try {
          updated = applyInput(task, body?.task);
        } catch (error) {
          return json({ message: error.message }, { status: 422 });
        }
        const errors = validate(updated);
        if (errors.length) return json({ errors }, { status: 422 });
        Object.assign(task, updated);
        return json({ data: serialiseTask(task) });
      })
    ),

    http.delete(
      url("/api/v1/tasks/:id"),
      authed(({ params }) => {
        if (!find(params.id)) return notFound();
        api.tasks = api.tasks.filter((task) => String(task.id) !== String(params.id));
        return json({ message: "Successfully Deleted" });
      })
    ),
  ];

  return api;
};

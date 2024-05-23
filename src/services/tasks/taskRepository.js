/**
 * The contract every task repository implements.
 *
 * ```
 * list()            -> Promise<Task[]>
 * get(id)           -> Promise<Task>
 * create(input)     -> Promise<Task>
 * update(id, input) -> Promise<Task>
 * updateStatus(id, status) -> Promise<Task>
 * remove(id)        -> Promise<void>
 * ```
 *
 * `input` is `{ title, description, priority, deadline }` and every method
 * resolves to tasks already run through `normaliseTask`, so the store never
 * sees the JSON:API envelope or the demo store's flat rows.
 *
 * Two implementations ship: `apiTaskRepository` (HTTP) and `demoTaskRepository`
 * (localStorage). `resolveTaskRepository` picks one from config; a third — a
 * GraphQL or IndexedDB backend — only has to satisfy the six methods above.
 */

const REQUIRED_METHODS = ["list", "get", "create", "update", "updateStatus", "remove"];

export const assertTaskRepository = (repository, name = "repository") => {
  const missing = REQUIRED_METHODS.filter(
    (method) => typeof repository?.[method] !== "function"
  );
  if (missing.length > 0) {
    throw new TypeError(
      `${name} is not a task repository: missing ${missing.join(", ")}`
    );
  }
  return repository;
};

export { REQUIRED_METHODS };

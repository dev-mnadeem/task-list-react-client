import config from "config";
import apiTaskRepository from "services/tasks/apiTaskRepository";
import createDemoTaskRepository from "services/tasks/demoTaskRepository";
import { assertTaskRepository } from "services/tasks/taskRepository";

let instance = null;

/**
 * Pick the repository the app should use. Memoised so the demo repository keeps
 * its in-memory copy across calls.
 */
export const resolveTaskRepository = () => {
  if (!instance) {
    instance = config.demoMode ? createDemoTaskRepository() : apiTaskRepository;
    assertTaskRepository(
      instance,
      config.demoMode ? "demoTaskRepository" : "apiTaskRepository"
    );
  }
  return instance;
};

/** Test seam: inject a stub, or clear it with `setTaskRepository(null)`. */
export const setTaskRepository = (repository) => {
  instance = repository ? assertTaskRepository(repository) : null;
};

export { assertTaskRepository };

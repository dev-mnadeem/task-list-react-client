import { normaliseTask, normaliseTasks, statusToCode } from "domain/task";
import httpClient from "services/http/httpClient";

const TASKS_PATH = "/api/v1/tasks";

/** The API nests payloads under `task` and replies under `data`. */
const envelope = (input) => ({
  task: {
    title: input.title,
    description: input.description,
    priority: input.priority,
    deadline: input.deadline,
    ...(input.status === undefined ? {} : { status: statusToCode(input.status) }),
  },
});

export const apiTaskRepository = {
  async list() {
    const { data } = await httpClient.get(TASKS_PATH);
    return normaliseTasks(data?.data);
  },

  async get(id) {
    const { data } = await httpClient.get(`${TASKS_PATH}/${id}`);
    return normaliseTask(data?.data);
  },

  async create(input) {
    const { data } = await httpClient.post(TASKS_PATH, envelope(input));
    return normaliseTask(data?.data);
  },

  async update(id, input) {
    const { data } = await httpClient.patch(`${TASKS_PATH}/${id}`, envelope(input));
    return normaliseTask(data?.data);
  },

  async updateStatus(id, status) {
    const { data } = await httpClient.patch(`${TASKS_PATH}/${id}`, {
      task: { status: statusToCode(status) },
    });
    return normaliseTask(data?.data);
  },

  async remove(id) {
    await httpClient.delete(`${TASKS_PATH}/${id}`);
  },
};

export default apiTaskRepository;

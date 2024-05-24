import * as Yup from "yup";

import { TASK_PRIORITIES, TaskPriority } from "domain/task";

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;

export const taskFormSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Give the task a title")
    .max(MAX_TITLE_LENGTH, `Keep the title under ${MAX_TITLE_LENGTH} characters`),
  description: Yup.string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters`
    ),
  priority: Yup.string()
    .oneOf(TASK_PRIORITIES, "Pick a priority")
    .required("Pick a priority"),
  deadline: Yup.string().nullable(),
});

export const emptyTaskForm = Object.freeze({
  title: "",
  description: "",
  priority: TaskPriority.MEDIUM,
  deadline: null,
});

export default taskFormSchema;

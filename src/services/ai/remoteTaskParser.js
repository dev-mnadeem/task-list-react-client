import axios from "axios";

import config from "config";
import { isValidPriority, TaskPriority } from "domain/task";

const SYSTEM_PROMPT =
  "Extract one task from the user's line. Reply with JSON only, using the keys " +
  "title, description, priority (low|medium|high) and deadline (YYYY-MM-DD or null).";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Never trust the model's shape. Anything that does not survive this check is
 * dropped and the caller's local result is used for that field instead.
 */
export const coerceRemoteResult = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  if (!title) return null;

  return {
    title,
    description:
      typeof payload.description === "string" ? payload.description.trim() : "",
    priority: isValidPriority(payload.priority)
      ? payload.priority
      : TaskPriority.MEDIUM,
    deadline:
      typeof payload.deadline === "string" && ISO_DAY.test(payload.deadline)
        ? payload.deadline
        : null,
  };
};

/**
 * An OpenAI-compatible chat-completions provider.
 *
 * It is opt-in: without `REACT_APP_AI_ENDPOINT` and `REACT_APP_AI_API_KEY` it
 * reports itself unavailable and the registry falls back to the local parser.
 */
export const remoteTaskParser = {
  name: "remote",

  isAvailable: () => Boolean(config.ai.endpoint && config.ai.apiKey),

  async parse(input) {
    const response = await axios.post(
      config.ai.endpoint,
      {
        model: process.env.REACT_APP_AI_MODEL || "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: String(input ?? "") },
        ],
      },
      {
        timeout: config.requestTimeoutMs,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.ai.apiKey}`,
        },
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    const parsed = coerceRemoteResult(JSON.parse(content));
    if (!parsed) throw new Error("Remote parser returned no usable task");
    return { ...parsed, hints: [], provider: "remote" };
  },
};

export default remoteTaskParser;

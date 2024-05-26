import { TaskPriority } from "domain/task";

const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const HIGH_WORDS = ["urgent", "asap", "critical", "important", "high priority"];
const LOW_WORDS = ["whenever", "someday", "low priority", "no rush", "eventually"];

const toIsoDay = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Next occurrence of a weekday, always in the future (never "today"). */
const nextWeekday = (from, targetIndex, skipAWeek) => {
  const base = startOfDay(from);
  let delta = (targetIndex - base.getDay() + 7) % 7;
  if (delta === 0) delta = 7;
  if (skipAWeek && delta < 7) delta += 7;
  return new Date(base.getTime() + delta * DAY_MS);
};

/**
 * Ordered because the first match wins and the longer phrases have to be tried
 * before the shorter ones they contain ("next friday" before "friday").
 */
const buildDateRules = (now) => [
  {
    pattern: /\b(?:by|on|due)?\s*today\b/i,
    resolve: () => startOfDay(now),
  },
  {
    pattern: /\b(?:by|on|due)?\s*tomorrow\b/i,
    resolve: () => new Date(startOfDay(now).getTime() + DAY_MS),
  },
  {
    pattern: /\b(?:by|on|due)?\s*next\s+week\b/i,
    resolve: () => new Date(startOfDay(now).getTime() + 7 * DAY_MS),
  },
  {
    pattern: /\b(?:by|on|due)?\s*end\s+of\s+(?:the\s+)?month\b/i,
    resolve: () => new Date(now.getFullYear(), now.getMonth() + 1, 0),
  },
  {
    pattern: /\b(?:by|on|due)?\s*in\s+(\d{1,3})\s+(day|days|week|weeks)\b/i,
    resolve: (match) => {
      const amount = Number(match[1]);
      const multiplier = match[2].startsWith("week") ? 7 : 1;
      return new Date(startOfDay(now).getTime() + amount * multiplier * DAY_MS);
    },
  },
  {
    pattern: new RegExp(
      `\\b(?:by|on|due)?\\s*(next\\s+)?(${WEEKDAYS.join("|")})\\b`,
      "i"
    ),
    resolve: (match) =>
      nextWeekday(now, WEEKDAYS.indexOf(match[2].toLowerCase()), Boolean(match[1])),
  },
  {
    pattern: /\b(?:by|on|due)?\s*(\d{4}-\d{2}-\d{2})\b/i,
    resolve: (match) => {
      const [year, month, day] = match[1].split("-").map(Number);
      return new Date(year, month - 1, day);
    },
  },
  {
    pattern: new RegExp(
      `\\b(?:by|on|due)?\\s*(${MONTHS.map((m) => `${m}|${m.slice(0, 3)}`).join(
        "|"
      )})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`,
      "i"
    ),
    resolve: (match) => {
      const token = match[1].toLowerCase();
      const monthIndex = MONTHS.findIndex((month) => month.startsWith(token));
      const day = Number(match[2]);
      const candidate = new Date(now.getFullYear(), monthIndex, day);
      if (candidate.getTime() < startOfDay(now).getTime()) {
        candidate.setFullYear(candidate.getFullYear() + 1);
      }
      return candidate;
    },
  },
];

const extractPriority = (text) => {
  const bang = text.match(/(?:^|\s)!(high|medium|med|low)\b/i);
  if (bang) {
    const token = bang[1].toLowerCase();
    return {
      priority: token === "med" ? TaskPriority.MEDIUM : token,
      matched: bang[0],
    };
  }

  const pLevel = text.match(/(?:^|\s)p([123])\b/i);
  if (pLevel) {
    const level = Number(pLevel[1]);
    const priority =
      level === 1
        ? TaskPriority.HIGH
        : level === 2
          ? TaskPriority.MEDIUM
          : TaskPriority.LOW;
    return { priority, matched: pLevel[0] };
  }

  for (const word of HIGH_WORDS) {
    const hit = text.match(new RegExp(`\\b${word}\\b`, "i"));
    if (hit) return { priority: TaskPriority.HIGH, matched: hit[0] };
  }
  for (const word of LOW_WORDS) {
    const hit = text.match(new RegExp(`\\b${word}\\b`, "i"));
    if (hit) return { priority: TaskPriority.LOW, matched: hit[0] };
  }
  return { priority: null, matched: null };
};

const tidy = (text) =>
  text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/^[\s,–—-]+|[\s,–—-]+$/g, "")
    .trim();

const capitalise = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/**
 * Turn one line of natural language into a draft task.
 *
 * Deterministic and offline — the same input always yields the same output,
 * which is why it can be unit-tested and why it is the fallback whenever a
 * remote provider is absent or fails.
 *
 * `Ship the changelog by next Friday !high` becomes
 * `{ title: "Ship the changelog", priority: "high", deadline: "<that Friday>" }`.
 */
export const parseTaskInput = (input, { now = new Date() } = {}) => {
  const original = String(input ?? "").trim();
  const hints = [];

  if (!original) {
    return {
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      deadline: null,
      hints,
      provider: "local",
    };
  }

  let working = original;

  const { priority, matched: priorityMatch } = extractPriority(working);
  if (priorityMatch) {
    working = working.replace(priorityMatch, " ");
    hints.push({ field: "priority", value: priority, from: priorityMatch.trim() });
  }

  let deadline = null;
  for (const rule of buildDateRules(now)) {
    const match = working.match(rule.pattern);
    if (!match) continue;
    const resolved = rule.resolve(match);
    if (!resolved || Number.isNaN(resolved.getTime())) continue;
    deadline = toIsoDay(resolved);
    working = working.replace(match[0], " ");
    hints.push({ field: "deadline", value: deadline, from: match[0].trim() });
    break;
  }

  const separator = working.match(/\s+(?:—|--|-)\s+/);
  let description = "";
  if (separator) {
    const index = working.indexOf(separator[0]);
    description = tidy(working.slice(index + separator[0].length));
    working = working.slice(0, index);
  }

  return {
    title: capitalise(tidy(working)),
    description: capitalise(description),
    priority: priority ?? TaskPriority.MEDIUM,
    deadline,
    hints,
    provider: "local",
  };
};

export const localTaskParser = {
  name: "local",
  /** Always available: no network, no credentials. */
  isAvailable: () => true,
  parse: async (input, options) => parseTaskInput(input, options),
};

export default localTaskParser;

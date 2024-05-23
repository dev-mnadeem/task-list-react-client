import { TaskPriority, TaskStatus } from "domain/task";

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDay = (offsetDays) =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);

/**
 * Seed rows for demo mode. Deadlines are relative to "today" so the board never
 * looks like a stale fixture and the overdue styling has something to render.
 */
export const buildSeedTasks = () => [
  {
    id: "1",
    title: "Send the Q3 revenue deck to Priya",
    description: "Numbers are final, just needs the cover slide.",
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    deadline: isoDay(1),
    createdAt: new Date(Date.now() - 3 * DAY_MS).toISOString(),
  },
  {
    id: "2",
    title: "Renew the TLS certificate",
    description: "staging.internal expires before the release window.",
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    deadline: isoDay(-2),
    createdAt: new Date(Date.now() - 9 * DAY_MS).toISOString(),
  },
  {
    id: "3",
    title: "Write the onboarding runbook",
    description: "Cover local setup, seed data and the two flaky tests.",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    deadline: isoDay(4),
    createdAt: new Date(Date.now() - 5 * DAY_MS).toISOString(),
  },
  {
    id: "4",
    title: "Review the pagination pull request",
    description: "Check the cursor encoding and the empty-page case.",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    deadline: isoDay(2),
    createdAt: new Date(Date.now() - 1 * DAY_MS).toISOString(),
  },
  {
    id: "5",
    title: "Book the dentist",
    description: "Six-month check-up, any afternoon works.",
    priority: TaskPriority.LOW,
    status: TaskStatus.PENDING,
    deadline: isoDay(11),
    createdAt: new Date(Date.now() - 2 * DAY_MS).toISOString(),
  },
  {
    id: "6",
    title: "Archive the 2022 marketing assets",
    description: "Move to cold storage and drop the shared drive copies.",
    priority: TaskPriority.LOW,
    status: TaskStatus.COMPLETED,
    deadline: isoDay(-6),
    createdAt: new Date(Date.now() - 20 * DAY_MS).toISOString(),
  },
  {
    id: "7",
    title: "Reply to the accessibility audit",
    description: "Three contrast failures on the settings screen.",
    priority: TaskPriority.HIGH,
    status: TaskStatus.COMPLETED,
    deadline: isoDay(-1),
    createdAt: new Date(Date.now() - 7 * DAY_MS).toISOString(),
  },
  {
    id: "8",
    title: "Plan the team offsite agenda",
    description: "Two workshop slots plus something that is not a workshop.",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    deadline: isoDay(16),
    createdAt: new Date(Date.now() - 4 * DAY_MS).toISOString(),
  },
  {
    id: "9",
    title: "Cancel the unused analytics seat",
    description: "Billing renews at the start of next month.",
    priority: TaskPriority.LOW,
    status: TaskStatus.IN_PROGRESS,
    deadline: isoDay(7),
    createdAt: new Date(Date.now() - 6 * DAY_MS).toISOString(),
  },
];

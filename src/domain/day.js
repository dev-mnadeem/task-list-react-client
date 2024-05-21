/**
 * Deadlines are calendar days (`YYYY-MM-DD`), not instants.
 *
 * `new Date("2030-06-15")` reads a date-only string as UTC midnight, which is
 * the previous evening anywhere west of Greenwich. These helpers keep a
 * deadline on the same local day in both directions.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a deadline as local midnight. Returns an invalid Date for junk. */
export const parseDay = (value) => {
  if (value instanceof Date) return new Date(value.getTime());
  const match = typeof value === "string" ? value.match(DATE_ONLY) : null;
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(value ?? Number.NaN);
};

const pad = (number) => String(number).padStart(2, "0");

/** Format a Date as the local calendar day it falls on. */
export const formatDay = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * Calendar arithmetic. Adding `days * 24h` drifts by an hour across a DST
 * change, which is enough to land on the wrong day from local midnight.
 */
export const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

/** The local day `offsetDays` from `now`, as `YYYY-MM-DD`. */
export const dayFromNow = (offsetDays, now = new Date()) =>
  formatDay(addDays(now, offsetDays));

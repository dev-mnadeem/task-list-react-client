import { describeDeadline } from "components/shared/DueDate";
import { addDays, dayFromNow, formatDay, parseDay } from "domain/day";
import { isOverdue, TaskStatus } from "domain/task";
import { parseTaskInput } from "services/ai/localTaskParser";

// These hold in every time zone; the suite also runs west of UTC, where a
// date-only string read as UTC midnight lands on the previous local day.

describe("parseDay", () => {
  it("reads YYYY-MM-DD as local midnight of that same day", () => {
    const day = parseDay("2030-06-15");
    expect([day.getFullYear(), day.getMonth(), day.getDate()]).toEqual([2030, 5, 15]);
    expect(day.getHours()).toBe(0);
  });

  it("returns an invalid date for junk and for null", () => {
    expect(Number.isNaN(parseDay("someday").getTime())).toBe(true);
    expect(Number.isNaN(parseDay(null).getTime())).toBe(true);
  });

  it("round-trips through formatDay", () => {
    expect(formatDay(parseDay("2031-01-09"))).toBe("2031-01-09");
  });
});

describe("addDays", () => {
  it("moves by calendar days, not by 24-hour blocks", () => {
    // US clocks go back on 2026-11-01; 48h from local midnight on Oct 31 is
    // still Nov 1 there.
    const start = new Date(2026, 9, 31);
    expect(formatDay(addDays(start, 2))).toBe("2026-11-02");
    expect(dayFromNow(-1, new Date(2026, 0, 1, 9))).toBe("2025-12-31");
  });
});

describe("deadlines on their own day", () => {
  const morning = new Date(2030, 5, 15, 8, 0, 0);

  it("is not overdue on the deadline day itself", () => {
    expect(
      isOverdue({ deadline: "2030-06-15", status: TaskStatus.PENDING }, morning)
    ).toBe(false);
  });

  it("says Today rather than Yesterday for today's deadline", () => {
    expect(describeDeadline("2030-06-15", morning).text).toBe("Today");
  });

  it("parses relative dates across a DST change", () => {
    const now = new Date(2026, 9, 31, 12, 0, 0);
    expect(parseTaskInput("Water the plants in 2 days", { now }).deadline).toBe(
      "2026-11-02"
    );
    expect(
      parseTaskInput("Water the plants tomorrow", { now: new Date(2026, 10, 1, 12) })
        .deadline
    ).toBe("2026-11-02");
  });
});

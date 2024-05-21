import { TaskPriority } from "domain/task";
import { parseTaskInput } from "services/ai/localTaskParser";

// A Saturday, so "next friday" and "friday" have distinguishable answers.
const NOW = new Date(2030, 5, 15, 9, 0, 0);
const parse = (text) => parseTaskInput(text, { now: NOW });

describe("priority extraction", () => {
  it("reads the !high / !medium / !low marker and removes it from the title", () => {
    const result = parse("Ship the changelog !high");
    expect(result.priority).toBe(TaskPriority.HIGH);
    expect(result.title).toBe("Ship the changelog");
  });

  it("accepts !med as medium", () => {
    expect(parse("Tidy the backlog !med").priority).toBe(TaskPriority.MEDIUM);
  });

  it("reads p1/p2/p3 shorthand", () => {
    expect(parse("Patch the auth bug p1").priority).toBe(TaskPriority.HIGH);
    expect(parse("Patch the auth bug p2").priority).toBe(TaskPriority.MEDIUM);
    expect(parse("Patch the auth bug p3").priority).toBe(TaskPriority.LOW);
  });

  it("infers high from urgency words and low from deferral words", () => {
    expect(parse("urgent call with legal").priority).toBe(TaskPriority.HIGH);
    expect(parse("Reorganise the photos someday").priority).toBe(TaskPriority.LOW);
  });

  it("defaults to medium when nothing signals a priority", () => {
    expect(parse("Water the plants").priority).toBe(TaskPriority.MEDIUM);
  });
});

describe("deadline extraction", () => {
  it("understands today and tomorrow", () => {
    expect(parse("Call the bank today").deadline).toBe("2030-06-15");
    expect(parse("Call the bank tomorrow").deadline).toBe("2030-06-16");
  });

  it("understands a bare weekday as the next one, never today", () => {
    // 2030-06-15 is a Saturday, so the next Monday is the 17th.
    expect(parse("Standup notes by monday").deadline).toBe("2030-06-17");
    expect(parse("Weekly review by saturday").deadline).toBe("2030-06-22");
  });

  it("pushes 'next <weekday>' a further week out", () => {
    expect(parse("Retro by next monday").deadline).toBe("2030-06-24");
  });

  it("understands relative spans", () => {
    expect(parse("Renew the domain in 2 weeks").deadline).toBe("2030-06-29");
    expect(parse("Chase the invoice in 3 days").deadline).toBe("2030-06-18");
    expect(parse("Plan the sprint next week").deadline).toBe("2030-06-22");
  });

  it("understands end of month and explicit dates", () => {
    expect(parse("Submit expenses end of month").deadline).toBe("2030-06-30");
    expect(parse("Board pack on 2030-09-04").deadline).toBe("2030-09-04");
    expect(parse("Conference talk on Oct 12").deadline).toBe("2030-10-12");
  });

  it("rolls a month-and-day that has already passed into next year", () => {
    expect(parse("File the return by January 5").deadline).toBe("2031-01-05");
  });

  it("leaves the deadline null when the line names no date", () => {
    expect(parse("Water the plants").deadline).toBeNull();
  });
});

describe("title and description", () => {
  it("splits a trailing description on a dash", () => {
    const result = parse("Draft the launch email tomorrow - keep it under 150 words");
    expect(result.title).toBe("Draft the launch email");
    expect(result.description).toBe("Keep it under 150 words");
  });

  it("strips every matched fragment out of the title at once", () => {
    const result = parse("Send the retro notes to Ana by friday !high");
    expect(result.title).toBe("Send the retro notes to Ana");
    expect(result.priority).toBe(TaskPriority.HIGH);
    expect(result.deadline).toBe("2030-06-21");
  });

  it("reports what it matched so the UI can explain itself", () => {
    const fields = parse("Ship it tomorrow !high").hints.map((hint) => hint.field);
    expect(fields).toEqual(expect.arrayContaining(["priority", "deadline"]));
  });

  it("returns an empty draft for empty input rather than throwing", () => {
    expect(parse("   ")).toMatchObject({ title: "", deadline: null });
    expect(parseTaskInput(undefined).title).toBe("");
  });

  it("is deterministic: the same input always parses the same way", () => {
    expect(parse("Review the PR by friday !high")).toEqual(
      parse("Review the PR by friday !high")
    );
  });
});

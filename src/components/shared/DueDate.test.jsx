import { describeDeadline } from "components/shared/DueDate";

const NOW = new Date(2030, 5, 15, 12, 0, 0);
const describe_ = (value) => describeDeadline(value, NOW);

describe("describeDeadline", () => {
  it("names today and tomorrow and marks them urgent", () => {
    expect(describe_("2030-06-15")).toEqual({ text: "Today", tone: "urgent" });
    expect(describe_("2030-06-16")).toEqual({ text: "Tomorrow", tone: "urgent" });
  });

  it("counts backwards for a passed deadline and marks it overdue", () => {
    expect(describe_("2030-06-14")).toEqual({ text: "Yesterday", tone: "overdue" });
    expect(describe_("2030-06-12")).toEqual({ text: "3 days ago", tone: "overdue" });
  });

  it("uses a relative span inside the coming week", () => {
    expect(describe_("2030-06-18")).toEqual({ text: "In 3 days", tone: "soon" });
  });

  it("switches to an absolute date once relative wording stops helping", () => {
    expect(describe_("2030-07-04")).toEqual({ text: "Jul 4", tone: "normal" });
  });

  it("handles a missing or unparseable value", () => {
    expect(describe_(null).text).toBe("No deadline");
    expect(describe_("someday").text).toBe("No deadline");
  });
});

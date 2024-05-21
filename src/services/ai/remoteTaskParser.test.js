import { TaskPriority } from "domain/task";
import { coerceRemoteResult, remoteTaskParser } from "services/ai/remoteTaskParser";

describe("coerceRemoteResult", () => {
  it("keeps a well-formed payload", () => {
    expect(
      coerceRemoteResult({
        title: " Ship it ",
        description: " soon ",
        priority: "high",
        deadline: "2030-01-02",
      })
    ).toEqual({
      title: "Ship it",
      description: "soon",
      priority: TaskPriority.HIGH,
      deadline: "2030-01-02",
    });
  });

  it("rejects a payload with no usable title", () => {
    expect(coerceRemoteResult({ title: "   " })).toBeNull();
    expect(coerceRemoteResult({ priority: "high" })).toBeNull();
    expect(coerceRemoteResult("not an object")).toBeNull();
    expect(coerceRemoteResult(null)).toBeNull();
  });

  it("replaces an invented priority with medium", () => {
    expect(coerceRemoteResult({ title: "x", priority: "apocalyptic" }).priority).toBe(
      TaskPriority.MEDIUM
    );
  });

  it("drops a deadline that is not an ISO day", () => {
    expect(
      coerceRemoteResult({ title: "x", deadline: "next tuesday" }).deadline
    ).toBeNull();
    expect(coerceRemoteResult({ title: "x", deadline: 20300102 }).deadline).toBeNull();
  });
});

describe("availability", () => {
  it("reports itself unavailable without an endpoint and a key", () => {
    // The test env sets neither REACT_APP_AI_ENDPOINT nor REACT_APP_AI_API_KEY.
    expect(remoteTaskParser.isAvailable()).toBe(false);
  });
});

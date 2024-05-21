import {
  describeError,
  readToken,
  writeToken,
  AUTH_TOKEN_KEY,
} from "services/http/httpClient";

beforeEach(() => window.localStorage.clear());

describe("token storage", () => {
  it("round-trips a token and clears it with null", () => {
    writeToken("Bearer abc");
    expect(readToken()).toBe("Bearer abc");
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe("Bearer abc");

    writeToken(null);
    expect(readToken()).toBeNull();
  });
});

describe("describeError", () => {
  it("prefers the API's message field", () => {
    expect(describeError({ response: { data: { message: "Nope" } } })).toBe("Nope");
  });

  it("joins an array of validation errors", () => {
    expect(
      describeError({ response: { data: { errors: ["Title is blank", "Too long"] } } })
    ).toBe("Title is blank, Too long");
  });

  it("falls back through error, timeout and message", () => {
    expect(describeError({ response: { data: { error: "Forbidden" } } })).toBe(
      "Forbidden"
    );
    expect(describeError({ code: "ECONNABORTED" })).toBe("The request timed out.");
    expect(describeError({ message: "Network Error" })).toBe("Network Error");
  });

  it("never returns undefined for an unrecognised shape", () => {
    expect(describeError({})).toBe("Something went wrong.");
    expect(describeError(null)).toBe("Something went wrong.");
  });
});

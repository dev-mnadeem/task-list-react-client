import {
  availableParsers,
  LOCAL_PARSER_NAME,
  parseTask,
  parseWithProvider,
  registerTaskParser,
} from "services/ai";

describe("parser registry", () => {
  it("uses the local parser when nothing else is configured", async () => {
    const draft = await parseTask("Ship the changelog tomorrow !high");
    expect(draft.provider).toBe(LOCAL_PARSER_NAME);
    expect(draft.title).toBe("Ship the changelog");
  });

  it("only offers providers that report themselves available", () => {
    // remoteTaskParser has no endpoint or key in the test environment.
    expect(availableParsers().map((parser) => parser.name)).toEqual([
      LOCAL_PARSER_NAME,
    ]);
  });

  it("routes to a registered provider that is available", async () => {
    const unregister = registerTaskParser({
      name: "stub",
      isAvailable: () => true,
      parse: async () => ({ title: "From the stub", provider: "stub" }),
    });

    await expect(parseWithProvider("stub", "anything")).resolves.toMatchObject({
      provider: "stub",
    });
    unregister();
  });

  it("falls back to the local parser when the provider throws", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const unregister = registerTaskParser({
      name: "flaky",
      isAvailable: () => true,
      parse: async () => {
        throw new Error("model unavailable");
      },
    });

    const draft = await parseWithProvider("flaky", "Call the vet tomorrow");

    expect(draft.provider).toBe(LOCAL_PARSER_NAME);
    expect(draft.title).toBe("Call the vet");
    expect(warn).toHaveBeenCalled();
    unregister();
    warn.mockRestore();
  });

  it("falls back when the provider is unavailable, without calling it", async () => {
    const parse = jest.fn();
    const unregister = registerTaskParser({
      name: "offline",
      isAvailable: () => false,
      parse,
    });

    const draft = await parseWithProvider("offline", "Book the dentist");

    expect(parse).not.toHaveBeenCalled();
    expect(draft.provider).toBe(LOCAL_PARSER_NAME);
    unregister();
  });

  it("falls back when the provider name is unknown", async () => {
    await expect(parseWithProvider("nope", "Water the plants")).resolves.toMatchObject({
      provider: LOCAL_PARSER_NAME,
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";

import theme from "theme";
import QuickCapture from "modules/Tasks/QuickCapture";

const setup = (onDraft = vi.fn()) => {
  render(
    <ThemeProvider theme={theme}>
      <QuickCapture onDraft={onDraft} />
    </ThemeProvider>
  );
  return onDraft;
};

describe("QuickCapture", () => {
  it("explains the syntax to everyone, not only on mouse hover", () => {
    setup();
    expect(
      screen.getByRole("textbox", { name: "Describe a task in plain language" })
    ).toHaveAccessibleDescription(/priority \(!high, p1\)/);
  });

  it("keeps Parse disabled until there is something to read", async () => {
    setup();
    expect(screen.getByRole("button", { name: "Parse" })).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "   ");
    expect(screen.getByRole("button", { name: "Parse" })).toBeDisabled();
  });

  it("hands a parsed draft to the board and shows what it understood", async () => {
    const onDraft = setup();

    await userEvent.type(screen.getByRole("textbox"), "Patch the auth bug p1");
    await userEvent.click(screen.getByRole("button", { name: "Parse" }));

    expect(onDraft).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Patch the auth bug", priority: "high" })
    );
    expect(screen.getByText("Parsed as")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("parses an example chip in one click", async () => {
    const onDraft = setup();
    await userEvent.click(screen.getByText("Renew the domain in 2 weeks"));
    expect(onDraft).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Renew the domain" })
    );
  });
});

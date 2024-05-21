import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";

import App from "App";
import { createTaskApi } from "mocks/taskApi";

// The whole app against the mock Rails API: no demo mode, no backend process.
vi.hoisted(() => vi.stubEnv("VITE_API_BASE_URL", "http://api.test"));

const api = createTaskApi();
const server = setupServer(...api.handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

const signIn = async (user, password) => {
  await user.clear(screen.getByLabelText("Email address"));
  await user.type(screen.getByLabelText("Email address"), "robin@example.com");
  await user.clear(screen.getByLabelText("Password"));
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
};

it("signs in, works the board through the API and signs out", async () => {
  const user = userEvent.setup();
  render(<App />);

  // No session and no demo mode: the guard sends the visitor to sign in.
  expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.queryByText(/demo account/i)).not.toBeInTheDocument();

  await signIn(user, "not-the-password");
  expect(await screen.findByText("Invalid Email or password.")).toBeInTheDocument();

  await signIn(user, "correct-horse");
  expect(
    await screen.findByRole("heading", { name: "Your board" })
  ).toBeInTheDocument();
  expect(await screen.findByText("Draft the sprint notes")).toBeInTheDocument();
  expect(screen.getByText("Robin Park")).toBeInTheDocument();
  // The API's "In progress" task is read as in progress, not pending: its
  // menu offers the other two statuses only.
  await user.click(
    screen.getByRole("button", { name: "Actions for Draft the sprint notes" })
  );
  const menu = await screen.findByRole("menu");
  expect(within(menu).getByText("Mark as pending")).toBeInTheDocument();
  expect(within(menu).queryByText("Mark as in progress")).not.toBeInTheDocument();
  await user.keyboard("{Escape}");

  await user.type(
    screen.getByLabelText("Describe a task in plain language"),
    "Call the venue in 3 days - confirm the projector"
  );
  await user.click(screen.getByRole("button", { name: "Parse" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByLabelText("Title")).toHaveValue("Call the venue");
  await user.click(within(dialog).getByRole("button", { name: "Add task" }));

  expect(
    await screen.findByRole("button", { name: "Actions for Call the venue" })
  ).toBeInTheDocument();
  expect(api.tasks.at(-1)).toMatchObject({
    title: "Call the venue",
    description: "Confirm the projector",
    priority: "medium",
    status: "pending",
  });

  await user.click(screen.getByRole("button", { name: "Sign out" }));
  expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(api.requests.at(-1)).toMatchObject({ method: "DELETE", path: "/logout" });
  expect(window.localStorage.getItem("authToken")).toBeNull();
});

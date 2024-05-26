import React from "react";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";

import theme from "theme";
import { TaskPriority, TaskStatus } from "domain/task";
import TaskList from "modules/Tasks/TaskList";

const task = (overrides) => ({
  id: "1",
  title: "Renew the TLS certificate",
  description: "staging.internal expires soon",
  priority: TaskPriority.HIGH,
  status: TaskStatus.PENDING,
  deadline: "2030-01-01",
  ...overrides,
});

const emptyPage = { items: [], page: 1, pageCount: 1, total: 0 };

const renderList = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <TaskList
        page={emptyPage}
        status="ready"
        error={null}
        hasTasks={false}
        isFiltered={false}
        onPageChange={jest.fn()}
        onClearFilters={jest.fn()}
        onCreate={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onStatusChange={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );

describe("TaskList", () => {
  it("shows skeleton rows while the first fetch is in flight", () => {
    renderList({ status: "loading" });
    expect(screen.getByLabelText("Loading tasks")).toBeInTheDocument();
  });

  it("explains an empty board and offers a way out of it", () => {
    renderList();
    expect(screen.getByText("Your board is empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add a task" })).toBeInTheDocument();
  });

  it("distinguishes 'no tasks at all' from 'no tasks match the filters'", () => {
    renderList({ hasTasks: true, isFiltered: true });
    expect(screen.getByText("No tasks match these filters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("surfaces the API error message when the fetch failed", () => {
    renderList({ status: "failed", error: "The API is down" });
    expect(screen.getByText("Could not load your tasks")).toBeInTheDocument();
    expect(screen.getByText("The API is down")).toBeInTheDocument();
  });

  it("renders a row per task with its title, description and count", () => {
    renderList({
      hasTasks: true,
      page: {
        items: [
          task(),
          task({ id: "2", title: "Second", description: "Nothing urgent" }),
        ],
        page: 1,
        pageCount: 1,
        total: 2,
      },
    });

    expect(screen.getByText("Renew the TLS certificate")).toBeInTheDocument();
    expect(screen.getByText("staging.internal expires soon")).toBeInTheDocument();
    expect(screen.getByText("showing 2 of 2")).toBeInTheDocument();
  });

  it("advances the status when the row's status button is clicked", async () => {
    const onStatusChange = jest.fn();
    renderList({
      hasTasks: true,
      page: { items: [task()], page: 1, pageCount: 1, total: 1 },
      onStatusChange,
    });

    await userEvent.click(
      screen.getByLabelText("Change status of Renew the TLS certificate")
    );

    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1" }),
      TaskStatus.IN_PROGRESS
    );
  });

  it("offers edit, the other statuses and delete in the row menu", async () => {
    const onEdit = jest.fn();
    renderList({
      hasTasks: true,
      page: { items: [task()], page: 1, pageCount: 1, total: 1 },
      onEdit,
    });

    await userEvent.click(
      screen.getByLabelText("Actions for Renew the TLS certificate")
    );

    expect(screen.getByText("Mark as in progress")).toBeInTheDocument();
    expect(screen.getByText("Mark as completed")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Edit task"));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    await waitForElementToBeRemoved(() => screen.queryByText("Mark as completed"));
  });

  it("only paginates when there is more than one page", () => {
    const { rerender } = renderList({
      hasTasks: true,
      page: { items: [task()], page: 1, pageCount: 1, total: 1 },
    });
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <TaskList
          page={{ items: [task()], page: 1, pageCount: 3, total: 21 }}
          status="ready"
          error={null}
          hasTasks
          isFiltered={false}
          onPageChange={jest.fn()}
          onClearFilters={jest.fn()}
          onCreate={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onStatusChange={jest.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});

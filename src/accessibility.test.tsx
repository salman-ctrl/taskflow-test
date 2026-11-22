import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./storage";

beforeEach(() => localStorage.clear());

function seedTasks(completed = false) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      tasks: ["First", "Middle", "Last"].map((title) => ({
        id: title,
        title,
        completed,
        createdAt: 123,
      })),
    }),
  );
}

describe("focus after a task leaves the visible list", () => {
  it("focuses the neighboring edit field when that task is already being edited", async () => {
    seedTasks();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Edit Last" }));
    await user.click(screen.getByRole("button", { name: "Delete Middle" }));
    expect(
      screen.getByRole("textbox", { name: "Edit task title" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("does not move focus when a removed row did not contain it", () => {
    seedTasks();
    render(<App />);
    const composer = screen.getByRole("textbox", {
      name: "A little progress starts here",
    });
    composer.focus();
    fireEvent.click(screen.getByRole("button", { name: "Delete Middle" }));
    expect(composer).toHaveFocus();
    expect(screen.queryByText("Middle")).not.toBeInTheDocument();
  });

  it("deletes with the keyboard, focuses the next row, then the previous row, then the composer", async () => {
    seedTasks();
    const user = userEvent.setup();
    render(<App />);
    // Reach the middle row's delete button entirely through keyboard traversal.
    await user.tab(); // Skip link
    await user.tab(); // All
    await user.tab(); // Active
    await user.tab(); // Completed
    await user.tab(); // Composer (Add is disabled)
    for (let step = 0; step < 6; step++) await user.tab();
    expect(screen.getByRole("button", { name: "Delete Middle" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("checkbox", { name: "Mark Last as completed" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Edit Last" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete Last" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("checkbox", { name: "Mark First as completed" }),
    ).toHaveFocus();
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("textbox", { name: "A little progress starts here" }),
    ).toHaveFocus();
    await user.keyboard("New task");
    await user.tab();
    expect(screen.getByRole("button", { name: "Add task" })).toHaveFocus();
  });

  it.each([
    { filter: "Active", completed: false, action: "completed" },
    { filter: "Completed", completed: true, action: "active" },
  ])(
    "restores useful focus when toggling tasks out of $filter",
    async ({ filter, completed, action }) => {
      seedTasks(completed);
      const user = userEvent.setup();
      render(<App />);
      await user.click(
        screen.getByRole("button", { name: new RegExp(`^${filter}`) }),
      );
      await user.tab();
      if (filter === "Active") await user.tab(); // Completed filter
      await user.tab(); // First checkbox after composer
      expect(
        screen.getByRole("checkbox", { name: `Mark First as ${action}` }),
      ).toHaveFocus();
      await user.keyboard(" ");
      expect(
        screen.getByRole("checkbox", { name: `Mark Middle as ${action}` }),
      ).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Edit Middle" })).toHaveFocus();
      await user.tab({ shift: true });
      await user.keyboard(" ");
      expect(
        screen.getByRole("checkbox", { name: `Mark Last as ${action}` }),
      ).toHaveFocus();
      await user.keyboard(" ");
      expect(
        screen.getByRole("textbox", { name: "A little progress starts here" }),
      ).toHaveFocus();
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    },
  );

  it("retains focus on the checkbox when toggling in All tasks", async () => {
    seedTasks();
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("checkbox", { name: "Mark First as completed" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Mark First as active" }),
    ).toHaveFocus();
  });
});

describe("repeatable task announcements", () => {
  it("clears and repopulates the same live region for consecutive identical adds", async () => {
    const user = userEvent.setup();
    render(<App />);
    const region = screen.getByRole("status", { name: "Task updates" });
    const input = screen.getByRole("textbox", {
      name: "A little progress starts here",
    });
    await user.type(input, "Read{Enter}");
    await waitFor(() => expect(region).toHaveTextContent("Added “Read”."));
    await user.type(input, "Read{Enter}");
    expect(region).toBeEmptyDOMElement();
    await waitFor(() => expect(region).toHaveTextContent("Added “Read”."));
    expect(screen.getByRole("status", { name: "Task updates" })).toBe(region);
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region.childNodes).toHaveLength(1);
    expect(
      screen.getAllByText("Read", { selector: ".task-title" }),
    ).toHaveLength(2);
  });

  it("reannounces consecutive identical deletes without retaining old messages", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [1, 2].map((id) => ({
          id: String(id),
          title: "Read",
          completed: false,
          createdAt: 123,
        })),
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    const region = screen.getByRole("status", { name: "Task updates" });
    await user.click(screen.getAllByRole("button", { name: "Delete Read" })[0]);
    await waitFor(() => expect(region).toHaveTextContent("Deleted “Read”."));
    await user.click(screen.getByRole("button", { name: "Delete Read" }));
    expect(region).toBeEmptyDOMElement();
    await waitFor(() => expect(region).toHaveTextContent("Deleted “Read”."));
    expect(region.textContent).toBe("Deleted “Read”.");
    expect(region.childNodes).toHaveLength(1);
  });

  it("coalesces rapid actions to the latest message and cancels pending speech on unmount", async () => {
    seedTasks();
    const user = userEvent.setup();
    const view = render(<App />);
    const region = screen.getByRole("status", { name: "Task updates" });
    await user.click(screen.getByRole("button", { name: "Delete First" }));
    await user.click(screen.getByRole("button", { name: "Delete Middle" }));
    await waitFor(() => expect(region.textContent).toBe("Deleted “Middle”."));
    expect(region).not.toHaveTextContent("First");
    await user.click(screen.getByRole("button", { name: "Delete Last" }));
    expect(region).toBeEmptyDOMElement();
    view.unmount();
    render(<App />);
    expect(
      screen.getByRole("status", { name: "Task updates" }),
    ).toBeEmptyDOMElement();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./storage";

beforeEach(() => {
  localStorage.clear();
});

describe("TaskFlow user journeys", () => {
  it("adds, edits, completes, reactivates, filters, reloads and deletes a task", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const input = screen.getByLabelText("A little progress starts here");
    expect(screen.getByRole("button", { name: "Add task" })).toBeDisabled();
    await user.type(input, "   ");
    expect(screen.getByRole("button", { name: "Add task" })).toBeDisabled();
    await user.clear(input);
    await user.type(input, "  Plan a focused day  {Enter}");
    expect(screen.getByText("Plan a focused day")).toBeVisible();
    expect(input).toHaveValue("");

    await user.click(
      screen.getByRole("button", { name: "Edit Plan a focused day" }),
    );
    const editInput = screen.getByRole("textbox", { name: "Edit task title" });
    expect(editInput).toHaveFocus();
    await user.clear(editInput);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    await user.type(editInput, "Ship TaskFlow{Enter}");
    expect(screen.getByText("Ship TaskFlow")).toBeVisible();

    await user.click(
      screen.getByRole("checkbox", { name: "Mark Ship TaskFlow as completed" }),
    );
    await user.click(screen.getByRole("button", { name: /^Active/ }));
    expect(screen.queryByText("Ship TaskFlow")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Completed/ }));
    expect(screen.getByText("Ship TaskFlow")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Task completion" }),
    ).toHaveAttribute("value", "1");

    unmount();
    render(<App />);
    expect(
      screen.getByRole("checkbox", { name: "Mark Ship TaskFlow as active" }),
    ).toBeChecked();
    await user.click(
      screen.getByRole("checkbox", { name: "Mark Ship TaskFlow as active" }),
    );
    await user.click(screen.getByRole("button", { name: /^Completed/ }));
    expect(screen.queryByText("Ship TaskFlow")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Active/ }));
    expect(screen.getByText("Ship TaskFlow")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Delete Ship TaskFlow" }),
    );
    expect(screen.queryByText("Ship TaskFlow")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).tasks).toEqual([]);
  });

  it("filters a mixed list and preserves edits and deletes through remounts", async () => {
    const user = userEvent.setup();
    let view = render(<App />);
    const input = screen.getByLabelText("A little progress starts here");
    await user.type(input, "First task{Enter}Second task{Enter}");
    await user.click(
      screen.getByRole("checkbox", { name: "Mark First task as completed" }),
    );
    await user.click(screen.getByRole("button", { name: /^Active/ }));
    expect(
      within(screen.getByRole("list", { name: "Active tasks" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(1);
    expect(screen.getByText("Second task")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /^Completed/ }));
    expect(screen.getByText("First task")).toBeVisible();
    expect(screen.queryByText("Second task")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^All tasks/ }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Edit Second task" }));
    await user.clear(screen.getByLabelText("Edit task title"));
    await user.type(screen.getByLabelText("Edit task title"), "Updated task");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Delete First task" }));
    view.unmount();
    view = render(<App />);
    expect(screen.getByText("Updated task")).toBeVisible();
    expect(screen.queryByText("First task")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    view.unmount();
  });

  it("cancels edits using Escape without changing stored text", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(
      screen.getByLabelText("A little progress starts here"),
      "Keep this{Enter}",
    );
    await user.click(screen.getByRole("button", { name: "Edit Keep this" }));
    await user.clear(screen.getByLabelText("Edit task title"));
    await user.type(
      screen.getByLabelText("Edit task title"),
      "Discard this{Escape}",
    );
    expect(screen.getByText("Keep this")).toBeVisible();
    expect(screen.queryByText("Discard this")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).tasks[0].title).toBe(
      "Keep this",
    );
  });

  it("recovers from malformed JSON without crashing", async () => {
    localStorage.setItem(STORAGE_KEY, "{bad json");
    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
    await userEvent.type(
      screen.getByLabelText("A little progress starts here"),
      "Fresh task{Enter}",
    );
    expect(screen.getByText("Fresh task")).toBeVisible();
  });

  it("keeps working and reports a storage write failure", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Browser storage is unavailable or full",
    );
    await userEvent.type(
      screen.getByLabelText("A little progress starts here"),
      "Session only{Enter}",
    );
    expect(screen.getByText("Session only")).toBeVisible();
    expect(screen.getByText("Changes are not saved")).toBeVisible();
  });
});

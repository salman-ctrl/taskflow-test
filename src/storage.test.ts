import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadTasks, saveTasks, STORAGE_KEY } from "./storage";

const valid = {
  id: "one",
  title: "Read a book",
  completed: false,
  createdAt: 123,
};
beforeEach(() => localStorage.clear());

describe("stored task validation", () => {
  it.each(["null", "[]", "{}", "42", '"text"', '{"version":2,"tasks":[]}'])(
    "handles invalid payload %s",
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      expect(loadTasks()).toEqual({ tasks: [], warning: expect.any(String) });
    },
  );

  it("salvages valid tasks while rejecting invalid, duplicate and empty entries", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [
          valid,
          null,
          { ...valid },
          { ...valid, id: "two", title: "   " },
          { ...valid, id: "three", completed: "false" },
          { ...valid, id: "four", createdAt: -1 },
          { ...valid, id: "five", title: "x".repeat(241) },
        ],
      }),
    );
    expect(loadTasks()).toEqual({
      tasks: [valid],
      warning: expect.stringContaining("skipped"),
    });
  });

  it("handles blocked localStorage reads", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    expect(loadTasks()).toEqual({ tasks: [], warning: expect.any(String) });
  });

  it("roundtrips all task fields", () => {
    expect(saveTasks([valid])).toBe(true);
    expect(loadTasks()).toEqual({ tasks: [valid], warning: null });
  });
});

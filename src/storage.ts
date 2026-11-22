import { MAX_TITLE_LENGTH, type Task } from "./types";

export const STORAGE_KEY = "taskflow.tasks.v1";

interface LoadResult {
  tasks: Task[];
  warning: string | null;
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    task.id.trim().length > 0 &&
    typeof task.title === "string" &&
    task.title.trim().length > 0 &&
    task.title.trim().length <= MAX_TITLE_LENGTH &&
    typeof task.completed === "boolean" &&
    typeof task.createdAt === "number" &&
    Number.isFinite(task.createdAt) &&
    task.createdAt >= 0
  );
}

export function loadTasks(): LoadResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: [], warning: null };
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("tasks" in parsed) ||
      !Array.isArray(parsed.tasks)
    ) {
      return {
        tasks: [],
        warning:
          "Saved task data could not be read. You can start a fresh list.",
      };
    }
    const seen = new Set<string>();
    const tasks: Task[] = [];
    for (const candidate of parsed.tasks) {
      if (isTask(candidate) && !seen.has(candidate.id)) {
        seen.add(candidate.id);
        tasks.push({
          id: candidate.id,
          title: candidate.title.trim(),
          completed: candidate.completed,
          createdAt: candidate.createdAt,
        });
      }
    }
    return {
      tasks,
      warning:
        tasks.length === parsed.tasks.length
          ? null
          : "Some saved tasks were invalid and were skipped. Your other tasks are ready.",
    };
  } catch {
    return {
      tasks: [],
      warning:
        "Saved tasks could not be loaded. Browser storage may be unavailable or the saved data may be damaged.",
    };
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks }),
    );
    return true;
  } catch {
    return false;
  }
}

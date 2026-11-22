import { useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./components/Icon";
import { ProgressCard } from "./components/ProgressCard";
import { TaskComposer } from "./components/TaskComposer";
import { TaskFilters } from "./components/TaskFilters";
import { TaskItem } from "./components/TaskItem";
import { useTasks } from "./hooks/useTasks";
import { useLiveAnnouncement } from "./hooks/useLiveAnnouncement";
import type { TaskFilter } from "./types";

const titles: Record<TaskFilter, string> = {
  all: "All tasks",
  active: "Active tasks",
  completed: "Completed tasks",
};
const emptyCopy: Record<TaskFilter, [string, string]> = {
  all: [
    "A fresh start, a clear mind.",
    "Add your first task above and turn a little intention into action.",
  ],
  active: [
    "All clear for now.",
    "Your active tasks will appear here. Add something new when you’re ready.",
  ],
  completed: [
    "Good things take one first step.",
    "Complete a task and celebrate your progress right here.",
  ],
};

export default function App() {
  const { tasks, saved, warning, addTask, editTask, toggleTask, deleteTask } =
    useTasks();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const { announcement, announce } = useLiveAnnouncement();
  const taskListRef = useRef<HTMLUListElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<{ taskId: string | null } | null>(null);
  const completed = tasks.filter((task) => task.completed).length;
  const counts = {
    all: tasks.length,
    active: tasks.length - completed,
    completed,
  };
  const visibleTasks = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "completed" ? task.completed : !task.completed),
  );

  function findTaskRow(id: string) {
    return Array.from(taskListRef.current?.children ?? []).find(
      (row) => row instanceof HTMLElement && row.dataset.taskId === id,
    );
  }

  function prepareFocusAfterRemoval(id: string) {
    const row = findTaskRow(id);
    if (!row?.contains(document.activeElement)) return;
    const index = visibleTasks.findIndex((task) => task.id === id);
    const neighbor = visibleTasks[index + 1] ?? visibleTasks[index - 1];
    pendingFocus.current = { taskId: neighbor?.id ?? null };
  }

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const nextInput = target.taskId
      ? findTaskRow(target.taskId)?.querySelector<HTMLInputElement>(
          "input:not([disabled])",
        )
      : null;
    (nextInput ?? taskInputRef.current)?.focus();
  }, [tasks, filter]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to tasks
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="check" size={23} />
          </span>
          <span>
            TaskFlow<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <TaskFilters filter={filter} onChange={setFilter} counts={counts} />
        <div className="sidebar-note">
          <span className="note-line" />
          <p>
            A little more focused.
            <br />A little less overwhelmed.
          </p>
        </div>
        <div className="device-note">
          <span className="device-dot" />
          Your space. Your pace.
        </div>
      </aside>

      <main id="main-content" tabIndex={-1}>
        <header className="topbar">
          <span>
            My workspace <span className="breadcrumb">/</span>{" "}
            <strong>Tasks</strong>
          </span>
          <span
            className={`save-status ${saved ? "" : "save-warning"}`}
            role="status"
          >
            <span className="status-dot" />
            {saved ? "Saved on this device" : "Changes are not saved"}
          </span>
        </header>
        <div className="main-inner">
          <section className="hero" aria-labelledby="page-title">
            <div className="eyebrow">
              <span /> A LITTLE CLARITY, EVERY DAY
            </div>
            <h1 id="page-title">
              Make room for
              <br />
              <span>what matters.</span>
            </h1>
            <p>
              A quiet space for your tasks. Clear your mind and find your flow.
            </p>
          </section>

          {warning && (
            <p className="notice" role="alert">
              {warning}
            </p>
          )}
          {!saved && (
            <p className="notice" role="alert">
              Browser storage is unavailable or full. Tasks still work for this
              session, but changes may be lost on reload.
            </p>
          )}

          <TaskComposer
            inputRef={taskInputRef}
            onAdd={(title) => {
              addTask(title);
              setFilter("all");
              announce(`Added “${title.trim()}”.`);
            }}
          />
          <section className="task-section" aria-labelledby="task-heading">
            <div className="section-heading">
              <h2 id="task-heading">
                {titles[filter]} <span>{visibleTasks.length}</span>
              </h2>
              <span className="remaining-count">
                {counts.active} {counts.active === 1 ? "task" : "tasks"} left
              </span>
            </div>
            {visibleTasks.length ? (
              <ul
                ref={taskListRef}
                className="task-list"
                aria-label={titles[filter]}
              >
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={(id, title) => {
                      editTask(id, title);
                      announce(`Updated task to “${title.trim()}”.`);
                    }}
                    onToggle={(id) => {
                      if (filter !== "all") prepareFocusAfterRemoval(id);
                      toggleTask(id);
                      announce(
                        task.completed
                          ? `Marked “${task.title}” active.`
                          : `Completed “${task.title}”.`,
                      );
                    }}
                    onDelete={(id) => {
                      prepareFocusAfterRemoval(id);
                      deleteTask(id);
                      announce(`Deleted “${task.title}”.`);
                    }}
                  />
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon
                    name={filter === "completed" ? "check" : "spark"}
                    size={30}
                  />
                </span>
                <h3>{emptyCopy[filter][0]}</h3>
                <p>{emptyCopy[filter][1]}</p>
              </div>
            )}
          </section>
          <ProgressCard total={tasks.length} completed={completed} />
          <footer>
            Less noise. More focus.<span>Made for your everyday.</span>
          </footer>
        </div>
        <div
          className="sr-only"
          role="status"
          aria-label="Task updates"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
      </main>
    </div>
  );
}

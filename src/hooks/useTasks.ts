import { useEffect, useState } from "react";
import { loadTasks, saveTasks } from "../storage";
import { MAX_TITLE_LENGTH, type Task } from "../types";

export function useTasks() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(saveTasks(tasks));
  }, [tasks]);

  function addTask(title: string) {
    const clean = title.trim();
    if (!clean || clean.length > MAX_TITLE_LENGTH) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: clean,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((current) => [task, ...current]);
  }

  function editTask(id: string, title: string) {
    const clean = title.trim();
    if (!clean || clean.length > MAX_TITLE_LENGTH) return;
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: clean } : task,
      ),
    );
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return {
    tasks,
    saved,
    warning: initial.warning,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
  };
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type TaskFilter = "all" | "active" | "completed";

export const MAX_TITLE_LENGTH = 240;

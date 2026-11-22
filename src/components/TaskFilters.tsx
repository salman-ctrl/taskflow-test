import type { TaskFilter } from "../types";
import { Icon } from "./Icon";

interface Props {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
}

const filters = [
  { id: "all", label: "All tasks", icon: "grid" },
  { id: "active", label: "Active", icon: "circle" },
  { id: "completed", label: "Completed", icon: "check" },
] as const;

export function TaskFilters({ filter, onChange, counts }: Props) {
  return (
    <nav className="task-filters" aria-label="Filter tasks">
      {filters.map((item) => (
        <button
          key={item.id}
          className={`filter-button ${filter === item.id ? "is-selected" : ""}`}
          aria-pressed={filter === item.id}
          onClick={() => onChange(item.id)}
        >
          <Icon name={item.icon} size={19} />
          <span>{item.label}</span>
          <span className="filter-count">{counts[item.id]}</span>
        </button>
      ))}
    </nav>
  );
}

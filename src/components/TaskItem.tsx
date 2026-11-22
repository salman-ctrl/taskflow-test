import { useEffect, useRef, useState, type FormEvent } from "react";
import { MAX_TITLE_LENGTH, type Task } from "../types";
import { Icon } from "./Icon";

interface Props {
  task: Task;
  onEdit: (id: string, title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onEdit, onToggle, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function finishEdit() {
    setEditing(false);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onEdit(task.id, draft);
    finishEdit();
  }

  return (
    <li
      data-task-id={task.id}
      className={`task-item ${task.completed ? "is-complete" : ""}`}
    >
      {editing ? (
        <form
          className="edit-form"
          onSubmit={submit}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              finishEdit();
            }
          }}
        >
          <label className="sr-only" htmlFor={`edit-${task.id}`}>
            Edit task title
          </label>
          <input
            ref={inputRef}
            id={`edit-${task.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_TITLE_LENGTH}
          />
          <button
            className="small-button"
            type="submit"
            disabled={!draft.trim()}
          >
            Save
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Cancel editing"
            onClick={finishEdit}
          >
            <Icon name="close" size={18} />
          </button>
        </form>
      ) : (
        <>
          <label className="task-toggle">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              aria-label={`Mark ${task.title} as ${task.completed ? "active" : "completed"}`}
            />
            <span className="custom-checkbox">
              <Icon name="check" size={14} />
            </span>
          </label>
          <span className="task-title">{task.title}</span>
          <div className="task-actions">
            <button
              ref={editButtonRef}
              className="icon-button"
              aria-label={`Edit ${task.title}`}
              onClick={() => {
                setDraft(task.title);
                setEditing(true);
              }}
            >
              <Icon name="edit" size={17} />
            </button>
            <button
              className="icon-button delete-button"
              aria-label={`Delete ${task.title}`}
              onClick={() => onDelete(task.id)}
            >
              <Icon name="trash" size={17} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}

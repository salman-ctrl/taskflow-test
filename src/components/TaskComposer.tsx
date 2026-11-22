import { useState, type FormEvent, type Ref } from "react";
import { MAX_TITLE_LENGTH } from "../types";
import { Icon } from "./Icon";

export function TaskComposer({
  onAdd,
  inputRef,
}: {
  onAdd: (title: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const [title, setTitle] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }

  return (
    <form className="composer" onSubmit={submit}>
      <label htmlFor="new-task">A little progress starts here</label>
      <div className="composer-field">
        <span className="input-plus">
          <Icon name="plus" />
        </span>
        <input
          ref={inputRef}
          id="new-task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="What would you like to get done?"
          autoComplete="off"
        />
        <button
          className="primary-button"
          type="submit"
          disabled={!title.trim()}
        >
          <span>Add task</span>
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <p className="field-hint">
        Keep it simple. One task at a time. <span>Press Enter to add</span>
      </p>
    </form>
  );
}

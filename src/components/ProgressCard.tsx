import { Icon } from "./Icon";

export function ProgressCard({
  total,
  completed,
}: {
  total: number;
  completed: number;
}) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section className="progress-card" aria-labelledby="progress-title">
      <div className="progress-heading">
        <span className="spark-icon">
          <Icon name="spark" size={18} />
        </span>
        <h2 id="progress-title">Small steps. Real progress.</h2>
      </div>
      <p>
        {total === 0
          ? "Your next chapter starts with one task."
          : completed === total
            ? "Everything checked off. Enjoy the breathing room."
            : "Every checkmark is a step forward. You’ve got this."}
      </p>
      <div className="progress-label">
        <span>Your progress</span>
        <strong>{percent}%</strong>
      </div>
      <progress
        max={total || 1}
        value={completed}
        aria-label="Task completion"
      />
      <div className="progress-detail">
        {completed} of {total} tasks completed
      </div>
    </section>
  );
}

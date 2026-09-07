import "./TaskCard.css";
import { Calendar, CheckCircle } from "lucide-react";

export default function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
}) {

  return (
    <div className="task-card">

      <div className="task-top">
        <h3 className="task-title">{task.title}</h3>

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      <p className="task-desc">{task.description}</p>

      <div className="task-info">
        <span>
          <Calendar size={14}/> {task.dueDate || "No deadline"}
        </span>

        <span>
          <CheckCircle size={14}/> {task.subtasks?.length || 0} subtasks
        </span>
      </div>

      <div className="progress">
        <small>Progress {task.progress || 0}%</small>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${task.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="task-actions">
        <button
          className="task-btn complete-btn"
          onClick={()=>onComplete(task._id)}
        >
          Complete
        </button>

        <button
          className="task-btn edit-btn"
          onClick={()=>onEdit(task)}
        >
          Edit
        </button>

        <button
          className="task-btn delete-btn"
          onClick={()=>onDelete(task._id)}
        >
          Delete
        </button>
      </div>

    </div>
  );
}
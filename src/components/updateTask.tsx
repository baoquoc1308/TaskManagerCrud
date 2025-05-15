import { supabase } from "../supabase-client";
import { useState } from "react";
import type { Task } from "../types/task";
import "../styles/App.css";
interface UpdateTaskProps {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const UpdateTask = ({ task, setTasks }: UpdateTaskProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState("");

  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, description: newDescription } : t
        )
      );
      setNewDescription("");
      setEditingId(null);
    } else {
      console.error("Error updating task:", error.message);
    }
  };

  return (
    <div className="task-actions">
      {editingId === task.id ? (
        <>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Updated description..."
          />
          <button className="save-btn" onClick={() => updateTask(task.id)}>
            Save
          </button>
          <button className="cancel-btn" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        </>
      ) : (
        <button
          className="edit-btn"
          onClick={() => {
            setEditingId(task.id);
            setNewDescription(task.description);
          }}
        >
          Edit
        </button>
      )}
    </div>
  );
};

import { supabase } from "../supabase-client";
import { uploadImage } from "../utils/uploadImage";
import "../styles/App.css";
const pageSize = 5;

interface SubmitTaskProps {
  session: any;
  newTask: { title: string; description: string };
  setNewTask: React.Dispatch<
    React.SetStateAction<{ title: string; description: string }>
  >;
  taskImage: File | null;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setNewTaskAdded: React.Dispatch<React.SetStateAction<number | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const SubmitTaskForm = ({
  session,
  newTask,
  setNewTask,
  taskImage,
  setTaskImage,
  setCurrentPage,
  setTotalCount,
  setNewTaskAdded,
  fileInputRef,
}: SubmitTaskProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...newTask, email: session.user.email, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
      return;
    }

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
      return;
    }

    setTotalCount(count ?? 0);
    setNewTaskAdded(data?.id ?? null);
    setNewTask({ title: "", description: "" });
    setTaskImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const pages = Math.ceil((count ?? 0) / pageSize);
    setCurrentPage(pages);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Task Title"
        value={newTask.title}
        onChange={(e) =>
          setNewTask((prev) => ({ ...prev, title: e.target.value }))
        }
        required
      />
      <textarea
        placeholder="Task Description"
        value={newTask.description}
        onChange={(e) =>
          setNewTask((prev) => ({ ...prev, description: e.target.value }))
        }
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && setTaskImage(e.target.files[0])}
        ref={fileInputRef}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

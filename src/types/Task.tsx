type Priority = "low" | "medium" | "high";
type Status = "todo" | "in-progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
  time?: string;
  priority?: Priority;
  status?: Status;
  avatar_url?: string;
}

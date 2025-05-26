import ThemeToggle from "../ThemeToggle";
import "./TaskManagerHeader.css";
export default function TaskManagerHeader({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <div className="task-header">
      <ThemeToggle />
      <span>{userEmail}</span>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
}

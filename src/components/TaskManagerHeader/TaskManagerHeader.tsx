import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import "./TaskManagerHeader.css";
export default function TaskManagerHeader({
  userEmail,
  onLogout,
  userRole,
}: {
  userEmail: string;
  onLogout: () => void;
  userRole: string | null;
}) {
  const navigate = useNavigate();
  return (
    <div className="task-header">
      {userRole === "manager" && (
        <button
          onClick={() => navigate("/manager-dashboard")}
          className="btn-manager-dashboard"
        >
          Manager Dashboard
        </button>
      )}
      <ThemeToggle />
      <span>{userEmail}</span>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
}

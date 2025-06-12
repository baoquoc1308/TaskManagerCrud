// components/TaskList/TaskList.jsx
import { useState, useEffect } from "react";
import type { Task } from "../../types/Task";
import { fetchUserAvatar } from "../../utils/FetchUserAvatar";
import "./TaskList.css";
import { supabase } from "../../supabase-client";
import TaskDetail from "../TaskDetail";
import { Empty, Modal, Input } from "antd";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import TaskSection from "../TaskSection/TaskSection";

interface TaskListProps {
  tasks: Task[];
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  newDescription: string;
  setNewDescription: React.Dispatch<React.SetStateAction<string>>;
  confirmDeleteTask: (task: Task) => void;
  updateTask: (
    taskId: number,
    title: string,
    userId: string,
    changes: string
  ) => Promise<void>;
  newTaskAdded: number | null;
  lastTaskRef: React.RefObject<HTMLLIElement | null>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  submitComponent?: React.ReactNode;
  userRole?: string;
}

export default function TaskList({
  tasks,
  editingId,
  setEditingId,
  newDescription,
  setNewDescription,
  confirmDeleteTask,
  updateTask,
  setTasks,
  setTaskId,
  submitComponent,
  userRole,
}: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] =
    useState(false);
  const [taskToDeleteFromDetail, setTaskToDeleteFromDetail] =
    useState<Task | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [taskToRename, setTaskToRename] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAvatars = async () => {
      const emailsToFetch = [
        ...new Set(
          tasks
            .map((task) => task.email)
            .filter((email) => email && !avatars[email])
        ),
      ] as string[];

      if (emailsToFetch.length === 0) {
        return;
      }

      const avatarPromises = emailsToFetch.map(async (email) => {
        const avatarUrl = await fetchUserAvatar(email);
        return [email, avatarUrl];
      });

      const settledAvatars = await Promise.all(avatarPromises);

      const newAvatars: Record<string, string> = {};
      settledAvatars.forEach(([email, avatarUrl]) => {
        if (email && avatarUrl) {
          newAvatars[email as string] = avatarUrl as string;
        }
      });

      if (Object.keys(newAvatars).length > 0) {
        setAvatars((prev) => ({ ...prev, ...newAvatars }));
      }
    };

    fetchAvatars();
  }, [tasks]);

  const handleClickTask = (taskId: string) => {
    if (editingId === null) setSelectedTaskId(taskId);
  };

  const toggleDropdown = (taskId: number) => {
    setOpenDropdownId((prevId) => (prevId === taskId ? null : taskId));
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setEditingId(null);
  };

  const handleOpenDeleteConfirmModal = (task: Task) => {
    setTaskToDeleteFromDetail(task);
    setIsDeleteConfirmModalVisible(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalVisible(false);
    setTaskToDeleteFromDetail(null);
  };

  const handleConfirmDeleteFromDetail = () => {
    if (taskToDeleteFromDetail) {
      confirmDeleteTask(taskToDeleteFromDetail);
      handleCloseModal();
      handleCloseDeleteConfirmModal();
    }
  };

  const handleOpenRenameModal = (task: Task) => {
    setTaskToRename(task);
    setNewTitle(task.title);
    setIsRenameModalVisible(true);
    setOpenDropdownId(null);
  };

  const handleCloseRenameModal = () => {
    setIsRenameModalVisible(false);
    setTaskToRename(null);
    setNewTitle("");
  };

  const handleConfirmRename = async () => {
    if (taskToRename && newTitle.trim() !== "") {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({ title: newTitle.trim() })
          .eq("id", taskToRename.id);

        if (error) {
          throw new Error(error.message);
        }

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskToRename.id
              ? { ...task, title: newTitle.trim() }
              : task
          )
        );

        toast.success("✏️ Task renamed successfully!");
        handleCloseRenameModal();
      } catch (error) {
        console.error("Failed to update task:", error);
        toast.error("Failed to rename task");

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskToRename.id ? taskToRename : task
          )
        );
      }
    }
  };

  const getInitialsFromEmail = (email: string) => {
    if (!email) return "NA";
    const username = email.split("@")[0];
    if (username.length === 1) return username[0].toUpperCase();
    return (username[0] + username[username.length - 1]).toUpperCase();
  };

  if (false) {
    handleOpenDeleteConfirmModal({} as Task);
  }

  if (tasks.length === 0) {
    return (
      <div style={{ marginTop: 50, textAlign: "center" }}>
        <Empty description="No tasks found" />
      </div>
    );
  }

  const taskSections = [
    {
      title: "Pending",
      status: "todo",
      statusClass: "pending",
    },
    {
      title: "In Progress",
      status: "in-progress",
      statusClass: "in-progress",
    },
    {
      title: "Completed",
      status: "done",
      statusClass: "completed",
    },
  ];

  return (
    <>
      <div className="main-container">
        <Sidebar submitComponent={submitComponent} userRole={userRole} />

        <div className="content-area">
          <div className="task-sections">
            {taskSections.map((section) => (
              <TaskSection
                key={section.status}
                title={section.title}
                status={section.status}
                statusClass={section.statusClass}
                tasks={tasks}
                avatars={avatars}
                openDropdownId={openDropdownId}
                onTaskClick={handleClickTask}
                onToggleDropdown={toggleDropdown}
                onRename={handleOpenRenameModal}
                onDelete={confirmDeleteTask}
                getInitialsFromEmail={getInitialsFromEmail}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={handleCloseModal}
          setTaskId={setSelectedTaskId}
          editingId={editingId}
          setEditingId={setEditingId}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          updateTask={updateTask}
          onDeleteSuccess={(deletedId) => {
            setTaskId(null);
            setTasks((prevTasks) =>
              prevTasks.filter((t) => t.id !== deletedId)
            );
          }}
        />
      )}

      <Modal
        title="Confirm Delete"
        open={isDeleteConfirmModalVisible}
        onOk={handleConfirmDeleteFromDetail}
        onCancel={handleCloseDeleteConfirmModal}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the task: "
          <strong>{taskToDeleteFromDetail?.title}</strong>"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      <Modal
        title="Rename"
        open={isRenameModalVisible}
        onOk={handleConfirmRename}
        onCancel={handleCloseRenameModal}
        okText="Rename"
        cancelText="Cancel"
        okButtonProps={{ disabled: !newTitle.trim() }}
      >
        <div>
          <Input
            id="taskTitle"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter task title"
            autoFocus
            onPressEnter={handleConfirmRename}
          />
        </div>
      </Modal>
    </>
  );
}

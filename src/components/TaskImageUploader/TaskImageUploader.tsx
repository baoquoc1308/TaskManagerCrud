import type { ChangeEvent } from "react";
import { useRef } from "react";
import "../styles/App.css";

interface TaskImageUploaderProps {
  taskImage: File | null;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
}

export const TaskImageUploader = ({
  taskImage,
  setTaskImage,
}: TaskImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  return (
    <div className="task-list">
      {taskImage && false}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
    </div>
  );
};

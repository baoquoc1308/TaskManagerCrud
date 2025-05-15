import type { ChangeEvent } from "react";
import { useRef } from "react";
import "../styles/App.css";

interface ChangeFileProps {
  taskImage: File | null;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
}

export const ChangeFile = ({ taskImage, setTaskImage }: ChangeFileProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  return (
    <div className="task_list">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </div>
  );
};

import "./DeleteModal.css";

export default function DeleteModal({
  show,
  onConfirm,
  onCancel,
}: {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Are you sure you want to delete this task?</h3>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

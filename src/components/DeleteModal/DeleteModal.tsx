import "./DeleteModal.css";

export default function DeleteModal({
  show,
  onConfirm,
  onCancel,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this task? This action cannot be undone.",
}: {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}) {
  if (!show) return null;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      {" "}
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        {" "}
        <button className="delete-modal-close-button" onClick={onCancel}>
          &times;
        </button>
        <div className="delete-modal-header">
          <div className="delete-icon-wrapper">
            <div className="trash-icon"></div>{" "}
          </div>
          <h3 className="delete-modal-title">{title}</h3>{" "}
        </div>
        <p className="delete-modal-message">{message}</p>{" "}
        <div className="delete-modal-buttons">
          {" "}
          <button className="delete-modal-confirm-button" onClick={onConfirm}>
            {" "}
            Delete
          </button>
          <button className="delete-modal-cancel-button" onClick={onCancel}>
            {" "}
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

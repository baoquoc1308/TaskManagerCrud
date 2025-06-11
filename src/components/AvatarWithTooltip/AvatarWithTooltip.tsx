import React, { useRef, useState } from "react";
import "./AvatarWithTooltip.css";
interface AvatarWithTooltipProps {
  avatarUrl?: string | null;
  email: string;
  initials: string;
}

const AvatarWithTooltip: React.FC<AvatarWithTooltipProps> = ({
  avatarUrl,
  email,
  initials,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const showAvatarImg = avatarUrl && avatarUrl.trim() !== "" && !imgError;

  return (
    <div
      className="assignee-avatar-wrapper"
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showAvatarImg ? (
        <img
          src={avatarUrl}
          alt={initials}
          className="assignee-avatar-img"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="assignee-avatar">{initials}</div>
      )}
      {showTooltip && <div className="avatar-tooltip">{email}</div>}
    </div>
  );
};

export default AvatarWithTooltip;

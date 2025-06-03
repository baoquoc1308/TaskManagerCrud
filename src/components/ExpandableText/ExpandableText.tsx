import React, { useState, useRef, useEffect } from "react";
import "./ExpandableText.css";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLines = 3,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const textParagraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textParagraphRef.current) {
      const element = textParagraphRef.current;

      const originalInlineStyles = {
        display: element.style.display,
        webkitLineClamp: element.style.webkitLineClamp,
        webkitBoxOrient: element.style.webkitBoxOrient,
        overflow: element.style.overflow,
      };

      element.style.display = "-webkit-box";
      element.style.webkitLineClamp = `${maxLines}`;
      element.style.webkitBoxOrient = "vertical";
      element.style.overflow = "hidden";

      const isOverflowing = element.scrollHeight > element.clientHeight;
      setShowToggle(isOverflowing);

      element.style.display = originalInlineStyles.display;
      element.style.webkitLineClamp = originalInlineStyles.webkitLineClamp;
      element.style.webkitBoxOrient = originalInlineStyles.webkitBoxOrient;
      element.style.overflow = originalInlineStyles.overflow;

      if (!isOverflowing) {
        setExpanded(false);
      }
    }
  }, [text, maxLines]);
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  let paragraphClassName = "text";
  if (showToggle) {
    paragraphClassName += expanded ? " expanded" : " clamped";
  }

  return (
    <div>
      <p
        ref={textParagraphRef}
        className={paragraphClassName}
        style={{ "--max-lines": maxLines } as React.CSSProperties}
      >
        {text}
      </p>

      {showToggle && !expanded && (
        <span className="ellipsis" onClick={handleToggleExpand}>
          ... Xem thêm
        </span>
      )}

      {showToggle && expanded && (
        <span className="toggle-btn" onClick={handleToggleExpand}>
          Thu gọn...
        </span>
      )}
    </div>
  );
};

export default ExpandableText;

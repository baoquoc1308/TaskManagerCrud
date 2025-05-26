import { useEffect, useState } from "react";
import "./ScrollButtons.css";

interface ScrollButtonsProps {
  scrollToBottomRef: React.RefObject<HTMLElement | null>;
}

export default function ScrollButtons({
  scrollToBottomRef,
}: ScrollButtonsProps) {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!showButtons) return null;

  return (
    <div className="scroll-buttons-container">
      <button onClick={scrollToTop} className="scroll-button">
        ▲
      </button>
      <button onClick={scrollToBottom} className="scroll-button">
        ▼
      </button>
    </div>
  );
}

// src/components/ScrollButtons.tsx
import { useEffect, useState } from 'react'

interface ScrollButtonsProps {
  scrollToBottomRef: React.RefObject<HTMLElement | null>
}

export default function ScrollButtons({
  scrollToBottomRef,
}: ScrollButtonsProps) {
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 999,
  }

  const buttonStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    marginBottom: '8px',
    borderRadius: '50%',
    backgroundColor: '#90e0ef',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    transition: 'background-color 0.3s, transform 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    lineHeight: 1,
    fontFamily: 'Arial, sans-serif', // Hoặc thử monospace nếu vẫn lệch
  }

  if (!showButtons) return null

  return (
    <div style={containerStyle}>
      <button
        onClick={scrollToTop}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#48cae4'
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#90e0ef'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        ▲
      </button>

      <button
        onClick={scrollToBottom}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#48cae4'
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#90e0ef'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        ▼
      </button>
    </div>
  )
}

import { useTheme } from '../contexts/ThemeContext'
import { useEffect } from 'react'
import '../styles/ThemeToggle.css'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`slider ${isDarkMode ? 'dark' : ''}`}>
        {isDarkMode ? '🌙' : '☀️'}
      </div>
    </div>
  )
}

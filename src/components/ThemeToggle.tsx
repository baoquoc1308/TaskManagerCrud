// ThemeToggle.tsx
import { useTheme } from '../contexts/ThemeContext' // hoặc đường dẫn đúng theo project của bạn
import { useEffect } from 'react'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])
  return <button onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
}

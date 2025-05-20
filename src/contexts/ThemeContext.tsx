// ThemeContext.tsx
import { createContext, useState, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = storedTheme === 'dark'
    setIsDarkMode(initialTheme)
    document.documentElement.setAttribute(
      'data-theme',
      initialTheme ? 'dark' : 'light'
    )
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    const themeStr = newTheme ? 'dark' : 'light'
    localStorage.setItem('theme', themeStr)
    document.documentElement.setAttribute('data-theme', themeStr)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

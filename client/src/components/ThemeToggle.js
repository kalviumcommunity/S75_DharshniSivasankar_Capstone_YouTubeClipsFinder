"use client"

import { useThemeContext } from "../context/ThemeContext"
import "./ThemeToggle.css"

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useThemeContext()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
    </button>
  )
}

export default ThemeToggle

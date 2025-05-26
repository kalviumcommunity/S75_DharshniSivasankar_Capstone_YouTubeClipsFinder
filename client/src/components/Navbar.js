"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useVideoContext } from "../context/VideoContext"
import { useAuthContext } from "../context/AuthContext"
import ThemeToggle from "./ThemeToggle"
import "./Navbar.css"

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { searchVideos } = useVideoContext()
  const { isAuthenticated, user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchVideos(searchQuery)
      navigate("/search")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-play-circle"></i>
          <span>YouTube Clips Finder</span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for clips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </form>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/saved" className="nav-link">
                Saved Clips
              </Link>
              <Link to="/playlists" className="nav-link">
                Playlists
              </Link>
              <div className="user-menu">
                <span className="username">{user?.username}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default Navbar

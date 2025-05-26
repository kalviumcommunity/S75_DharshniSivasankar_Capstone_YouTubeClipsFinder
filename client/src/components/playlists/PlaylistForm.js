"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./PlaylistForm.css"

const PlaylistForm = ({ onPlaylistCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.name) {
      setError("Playlist name is required")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post("https://clipfinder.onrender.com/api/playlists", formData)

      if (onPlaylistCreated) {
        onPlaylistCreated(res.data)
      } else {
        navigate(`/playlists/${res.data._id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="playlist-form-container">
      <h2>Create New Playlist</h2>

      {error && <div className="form-error">{error}</div>}

      <form className="playlist-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Playlist Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter playlist name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter playlist description"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" className="playlist-submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </div>
  )
}

export default PlaylistForm

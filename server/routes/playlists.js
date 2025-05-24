const express = require("express")
const router = express.Router()
const Playlist = require("../models/Playlist")
const Video = require("../models/Video")
const auth = require("../middleware/auth")

// Get all playlists for a user
router.get("/", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("videos", "videoId title thumbnail duration")

    res.json(playlists)
  } catch (error) {
    console.error("Error fetching playlists:", error)
    res.status(500).json({ message: "Error fetching playlists" })
  }
})


// Get a single playlist by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("videos")

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    res.json(playlist)
  } catch (error) {
    console.error("Error fetching playlist:", error)
    res.status(500).json({ message: "Error fetching playlist" })
  }
})



module.exports = router
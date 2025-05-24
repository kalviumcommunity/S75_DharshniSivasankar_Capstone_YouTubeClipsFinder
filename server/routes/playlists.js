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


// Create a new playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body

    const newPlaylist = new Playlist({
      name,
      description,
      user: req.user.id,
    })

    await newPlaylist.save()
    res.status(201).json(newPlaylist)
  } catch (error) {
    console.error("Error creating playlist:", error)
    res.status(500).json({ message: "Error creating playlist" })
  }
})

// Add a video to a playlist
router.post("/:id/videos", auth, async (req, res) => {
  try {
    const { videoId } = req.body

    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if the playlist belongs to the user
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    // Find the video in the database or create it
    const video = await Video.findOne({ videoId })

    if (!video) {
      return res.status(404).json({ message: "Video not found" })
    }

    // Check if video is already in the playlist
    if (playlist.videos.includes(video._id)) {
      return res.status(400).json({ message: "Video already in playlist" })
    }

    playlist.videos.push(video._id)
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    console.error("Error adding video to playlist:", error)
    res.status(500).json({ message: "Error adding video to playlist" })
  }
})

module.exports = router
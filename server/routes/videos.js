const express = require("express")
const router = express.Router()
const { google } = require("googleapis")
const Video = require("../models/Video")
const auth = require("../middleware/auth")

// Initialize YouTube API
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
})

// GET /api/videos/search - Search videos
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const response = await youtube.search.list({
      part: "snippet",
      q: `${q} movie clip`,
      maxResults: 20,
      type: "video",
      videoDuration: "short", // Only short videos (< 4 minutes)
    })

    const videoIds = response.data.items.map((item) => item.id.videoId).join(",")

    // Get additional video details
    const videoDetails = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoIds,
    })

    const videos = videoDetails.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: formatDate(item.snippet.publishedAt),
      viewCount: formatCount(item.statistics.viewCount),
      likeCount: formatCount(item.statistics.likeCount),
      duration: formatDuration(item.contentDetails.duration),
    }))

    res.json(videos)
  } catch (error) {
    console.error("Error searching videos:", error)
    res.status(500).json({ message: "Error searching videos" })
  }
})

// GET /api/videos/trending - Get trending videos
router.get("/trending", async (req, res) => {
  try {
    const { category = "drama" } = req.query

    const response = await youtube.search.list({
      part: "snippet",
      q: `${category} movie clip`,
      maxResults: 12,
      type: "video",
      videoDuration: "short",
      order: "viewCount",
    })

    const videoIds = response.data.items.map((item) => item.id.videoId).join(",")

    // Get additional video details
    const videoDetails = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoIds,
    })

    const videos = videoDetails.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: formatDate(item.snippet.publishedAt),
      viewCount: formatCount(item.statistics.viewCount),
      likeCount: formatCount(item.statistics.likeCount),
      duration: formatDuration(item.contentDetails.duration),
    }))

    res.json(videos)
  } catch (error) {
    console.error("Error fetching trending videos:", error)
    res.status(500).json({ message: "Error fetching trending videos" })
  }
})

// GET /api/videos/saved - Get saved videos (protected route)
router.get("/saved", auth, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(videos)
  } catch (error) {
    console.error("Error fetching saved videos:", error)
    res.status(500).json({ message: "Error fetching saved videos" })
  }
})

// GET /api/videos/:videoId - Get video details
router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params

    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    })

    if (!response.data.items.length) {
      return res.status(404).json({ message: "Video not found" })
    }

    const item = response.data.items[0]
    const video = {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: formatDate(item.snippet.publishedAt),
      viewCount: formatCount(item.statistics.viewCount),
      likeCount: formatCount(item.statistics.likeCount),
      duration: formatDuration(item.contentDetails.duration),
    }

    res.json(video)
  } catch (error) {
    console.error("Error fetching video details:", error)
    res.status(500).json({ message: "Error fetching video details" })
  }
})

// GET /api/videos/related/:videoId - Get related videos
router.get("/related/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params

    // First get the video details to extract keywords
    const videoResponse = await youtube.videos.list({
      part: "snippet",
      id: videoId,
    })

    if (!videoResponse.data.items.length) {
      return res.status(404).json({ message: "Video not found" })
    }

    const video = videoResponse.data.items[0]
    const relatedQuery = video.snippet.title + " movie clip"

    const response = await youtube.search.list({
      part: "snippet",
      q: relatedQuery,
      maxResults: 5,
      type: "video",
      videoDuration: "short",
    })

    const relatedVideoIds = response.data.items
      .filter((item) => item.id.videoId !== videoId) // Filter out the current video
      .map((item) => item.id.videoId)
      .join(",")

    if (!relatedVideoIds) {
      return res.json([])
    }

    // Get additional video details
    const videoDetails = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: relatedVideoIds,
    })

    const videos = videoDetails.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: formatDate(item.snippet.publishedAt),
      viewCount: formatCount(item.statistics.viewCount),
      likeCount: formatCount(item.statistics.likeCount),
      duration: formatDuration(item.contentDetails.duration),
    }))

    res.json(videos)
  } catch (error) {
    console.error("Error fetching related videos:", error)
    res.status(500).json({ message: "Error fetching related videos" })
  }
})

// POST /api/videos/save - Save a video (protected route)
router.post("/save", auth, async (req, res) => {
  try {
    const videoData = req.body

    // Check if video already exists for this user
    const existingVideo = await Video.findOne({
      videoId: videoData.videoId,
      user: req.user.id,
    })

    if (existingVideo) {
      return res.status(400).json({ message: "Video already saved" })
    }

    // Create new video with user reference
    const video = new Video({
      ...videoData,
      user: req.user.id,
    })

    await video.save()

    res.status(201).json(video)
  } catch (error) {
    console.error("Error saving video:", error)
    res.status(500).json({ message: "Error saving video" })
  }
})

// DELETE /api/videos/saved/:id - Remove a saved video (protected route)
router.delete("/saved/:id", auth, async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findOneAndDelete({
      videoId: id,
      user: req.user.id,
    })

    if (!video) {
      return res.status(404).json({ message: "Video not found" })
    }

    res.json({ message: "Video removed successfully" })
  } catch (error) {
    console.error("Error removing video:", error)
    res.status(500).json({ message: "Error removing video" })
  }
})

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}

function formatCount(count) {
  if (!count) return "0"

  const num = Number.parseInt(count)
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  } else {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
}

function formatDuration(duration) {
  // Convert ISO 8601 duration to readable format
  // Example: PT1H30M15S -> 1:30:15
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) return "0:00"

  const hours = match[1] ? Number.parseInt(match[1]) : 0
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  const seconds = match[3] ? Number.parseInt(match[3]) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

module.exports = router

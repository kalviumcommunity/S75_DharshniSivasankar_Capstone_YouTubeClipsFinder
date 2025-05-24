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

module.exports = router
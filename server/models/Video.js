const mongoose = require("mongoose")

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  thumbnail: String,
  channelTitle: String,
  publishedAt: String,
  viewCount: String,
  likeCount: String,
  duration: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a compound index to ensure a user can't save the same video twice
videoSchema.index({ videoId: 1, user: 1 }, { unique: true })

module.exports = mongoose.model("Video", videoSchema)

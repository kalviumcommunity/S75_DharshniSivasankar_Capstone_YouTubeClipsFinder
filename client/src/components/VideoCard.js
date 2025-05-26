"use client"
import { Link } from "react-router-dom"
import { useVideoContext } from "../context/VideoContext"
import "./VideoCard.css"

const VideoCard = ({ video }) => {
  const { saveVideo, removeVideo, isVideoSaved } = useVideoContext()
  const saved = isVideoSaved(video.videoId)

  const handleSaveToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (saved) {
      removeVideo(video.videoId)
    } else {
      saveVideo(video)
    }
  }

  return (
    <div className="video-card">
      <Link to={`/video/${video.videoId}`} className="video-link">
        <div className="thumbnail-container">
          <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="video-thumbnail" />
          <div className="video-duration">{video.duration || "3:45"}</div>
        </div>
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">{video.channelTitle}</p>
          <div className="video-meta">
            <span>{video.viewCount || "10K"} views</span>
            <span>•</span>
            <span>{video.publishedAt || "3 days ago"}</span>
          </div>
        </div>
      </Link>
      <button className={`save-button ${saved ? "saved" : ""}`} onClick={handleSaveToggle}>
        <i className={`fas ${saved ? "fa-bookmark" : "fa-bookmark"}`}></i>
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  )
}

export default VideoCard

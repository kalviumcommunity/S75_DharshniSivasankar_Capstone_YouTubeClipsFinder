import "./VideoPlayer.css"

const VideoPlayer = ({ videoId }) => {
  return (
    <div className="video-player-container">
      <iframe
        className="video-player"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default VideoPlayer

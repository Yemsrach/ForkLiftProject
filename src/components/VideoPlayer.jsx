"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { CustomButton } from "./CustomButton"
import { CustomSlider } from "./CustomSlider"
import { Maximize, Play, Pause, Volume2, VolumeX } from "lucide-react"

export function VideoPlayer({ src, title, panRotation, tiltRotation, rollRotation, zoomScale }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Synchronize video play/pause state with the isPlaying prop
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.play().catch((e) => console.error("Error playing video:", e))
      } else {
        video.pause()
      }
    }
  }, [isPlaying])

  // Synchronize video volume and mute state
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = isMuted
    }
  }, [volume, isMuted])

  // Apply pan, tilt, roll, and zoom to the video element using CSS transform
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // For a 360 camera, pan is Y-axis rotation, tilt is X-axis rotation, roll is Z-axis rotation, zoom is scale
      video.style.transform = `scale(${zoomScale}) rotateX(${tiltRotation}deg) rotateY(${panRotation}deg) rotateZ(${rollRotation}deg)`
    }
  }, [panRotation, tiltRotation, rollRotation, zoomScale])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleVolumeChange = useCallback((value) => {
    setVolume(value[0])
    if (value[0] === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }, [])

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev)
    if (isMuted) {
      setVolume(0.5) // Restore a default volume if unmuting from 0
    } else {
      setVolume(0)
    }
  }, [isMuted])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setDuration(video.duration)
    }
  }, [])

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if (videoRef.current.mozRequestFullScreen) {
        /* Firefox */
        videoRef.current.mozRequestFullScreen()
      } else if (videoRef.current.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        videoRef.current.webkitRequestFullscreen()
      } else if (videoRef.current.msRequestFullscreen) {
        /* IE/Edge */
        videoRef.current.msRequestFullscreen()
      }
    }
  }, [])

  return (
    <div className="video-player-container">
      <div className="video-title-overlay">
        <div>{title}</div>
      </div>
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handlePlayPause} // Toggle play/pause on video click
      />
      <div className="video-controls-overlay">
        <div className="slider-wrapper">
          <CustomSlider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={(value) => {
              if (videoRef.current) {
                videoRef.current.currentTime = value[0]
              }
            }}
          />
        </div>
        <div className="video-controls-bar">
          <CustomButton className="icon-button" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </CustomButton>
          <CustomButton className="icon-button" onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted || volume === 0 ? (
              <VolumeX className="w-6 h-6 fill-white" />
            ) : (
              <Volume2 className="w-6 h-6 fill-white" />
            )}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </CustomButton>
          <CustomSlider className="volume" value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} />
          <div className="video-time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <CustomButton
            className="icon-button video-fullscreen-button"
            onClick={handleFullscreen}
            aria-label="Fullscreen"
          >
            <Maximize className="w-6 h-6" />
            <span className="sr-only">Fullscreen</span>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

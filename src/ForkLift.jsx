"use client"

import { useState, useCallback } from "react"
import { VideoPlayer } from "./components/VIdeoPlayer"
import { VideoControls } from "./components/VideoControls"

export default function ForkliftApp() {
  // State for video transformations (pan, tilt, roll, zoom)
  const [leftVideoTransform, setLeftVideoTransform] = useState({ pan: 0, tilt: 0, roll: 0, zoom: 1 })
  const [rightVideoTransform, setRightVideoTransform] = useState({ pan: 0, tilt: 0, roll: 0, zoom: 1 })

  const mainRotationStep = 5 // Degrees for main tilt/roll per click
  const fineRotationStep = 1 // Degrees for pan/fine-tune tilt per click
  const zoomStep = 0.1 // Factor to zoom per click
  const minZoom = 0.5
  const maxZoom = 2.0

  // Function to handle pan (horizontal rotation - Yaw) for both videos (INNER D-PAD)
  const handlePan = useCallback(
    (direction) => {
      setLeftVideoTransform((prev) => ({
        ...prev,
        pan: prev.pan + (direction === "left" ? -fineRotationStep : fineRotationStep),
      }))
      setRightVideoTransform((prev) => ({
        ...prev,
        pan: prev.pan + (direction === "left" ? -fineRotationStep : fineRotationStep),
      }))
    },
    [fineRotationStep],
  )

  // Function to handle main tilt (vertical rotation - Pitch) for both videos (OUTER D-PAD)
  const handleTilt = useCallback(
    (direction) => {
      setLeftVideoTransform((prev) => ({
        ...prev,
        tilt: prev.tilt + (direction === "up" ? -mainRotationStep : mainRotationStep),
      }))
      setRightVideoTransform((prev) => ({
        ...prev,
        tilt: prev.tilt + (direction === "up" ? -mainRotationStep : mainRotationStep),
      }))
    },
    [mainRotationStep],
  )

  // Function to handle fine-tune tilt (Pitch) for both videos (INNER D-PAD)
  const handleFineTilt = useCallback(
    (direction) => {
      setLeftVideoTransform((prev) => ({
        ...prev,
        tilt: prev.tilt + (direction === "up" ? -fineRotationStep : fineRotationStep),
      }))
      setRightVideoTransform((prev) => ({
        ...prev,
        tilt: prev.tilt + (direction === "up" ? -fineRotationStep : fineRotationStep),
      }))
    },
    [fineRotationStep],
  )

  // Function to handle roll (Z-axis rotation) for both videos (OUTER D-PAD)
  const handleRoll = useCallback(
    (direction) => {
      setLeftVideoTransform((prev) => ({
        ...prev,
        roll: prev.roll + (direction === "left" ? -mainRotationStep : mainRotationStep),
      }))
      setRightVideoTransform((prev) => ({
        ...prev,
        roll: prev.roll + (direction === "left" ? -mainRotationStep : mainRotationStep),
      }))
    },
    [mainRotationStep],
  )

  // Function to handle zoom in for both videos
  const handleZoomIn = useCallback(() => {
    setLeftVideoTransform((prev) => ({
      ...prev,
      zoom: Math.min(maxZoom, prev.zoom + zoomStep),
    }))
    setRightVideoTransform((prev) => ({
      ...prev,
      zoom: Math.min(maxZoom, prev.zoom + zoomStep),
    }))
  }, [zoomStep, maxZoom])

  // Function to handle zoom out for both videos
  const handleZoomOut = useCallback(() => {
    setLeftVideoTransform((prev) => ({
      ...prev,
      zoom: Math.max(minZoom, prev.zoom - zoomStep),
    }))
    setRightVideoTransform((prev) => ({
      ...prev,
      zoom: Math.max(minZoom, prev.zoom - zoomStep),
    }))
  }, [zoomStep, minZoom])

  // Function to reset all transformations for both videos
  const handleResetAll = useCallback(() => {
    setLeftVideoTransform({ pan: 0, tilt: 0, roll: 0, zoom: 1 })
    setRightVideoTransform({ pan: 0, tilt: 0, roll: 0, zoom: 1 })
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Forklift 1 - Dual 360 Camera View</h1>
      </header>

      <main className="main-content">
        <div className="video-section">
          <h2>Left Camera</h2>
          <VideoPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            title="Sample Video 1: For Bigger Blazes"
            panRotation={leftVideoTransform.pan}
            tiltRotation={leftVideoTransform.tilt}
            rollRotation={leftVideoTransform.roll}
            zoomScale={leftVideoTransform.zoom}
          />
        </div>
        <div className="video-section">
          <h2>Right Camera</h2>
          <VideoPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
            title="Sample Video 2: For Bigger Joyrides"
            panRotation={rightVideoTransform.pan}
            tiltRotation={rightVideoTransform.tilt}
            rollRotation={rightVideoTransform.roll}
            zoomScale={rightVideoTransform.zoom}
          />
        </div>
      </main>

      <footer className="app-footer">
        <VideoControls
          onPan={handlePan}
          onTilt={handleTilt}
          onFineTilt={handleFineTilt}
          onRoll={handleRoll}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetAll={handleResetAll}
        />
      </footer>
    </div>
  )
}

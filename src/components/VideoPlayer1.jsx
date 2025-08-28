import { useRef, useState, useEffect } from "react"

export function VideoPlayer({ src, title, isPlaceholder = false, cameraId, onFullscreen }) {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [videoError, setVideoError] = useState(false)
    const [isLive, setIsLive] = useState(true)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    const togglePlay = () => {
        if (videoRef.current && !isPlaceholder) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play().catch((error) => {
                    console.error("Error playing video:", error)
                    setVideoError(true)
                })
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleVolumeChange = (e) => {
        const newVolume = Number.parseFloat(e.target.value)
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
    }

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!isFullscreen) {
                containerRef.current.requestFullscreen().catch((error) => {
                    console.error("Error entering fullscreen:", error)
                })
                onFullscreen?.(cameraId)
            } else {
                document.exitFullscreen().catch((error) => {
                    console.error("Error exiting fullscreen:", error)
                })
            }
        }
    }

    const handleVideoError = () => {
        setVideoError(true)
        setIsPlaying(false)
        console.error(`Video error for ${title}`)
    }

    const handleVideoLoad = () => {
        setVideoError(false)
        if (videoRef.current) {
            // Auto-play live streams
            if (isLive) {
                videoRef.current.play().catch(() => {
                    // Silent fail for autoplay restrictions
                })
            }
        }
    }

    if (isPlaceholder) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                <img src={src || "/placeholder.svg"} alt={title} className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300 font-medium">Waiting for {title.toLowerCase()}...</p>
                        <p className="text-gray-500 text-sm mt-2">Camera ID: {cameraId.toUpperCase()}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (videoError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-900/20 relative">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-red-400 font-medium">Camera Error</p>
                    <p className="text-gray-400 text-sm mt-1">{title}</p>
                    <button
                        onClick={() => {
                            setVideoError(false)
                            if (videoRef.current) {
                                videoRef.current.load()
                            }
                        }}
                        className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className={`relative w-full h-full group ${isFullscreen ? "bg-black" : ""}`}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                autoPlay={isLive}
                muted={volume === 0}
                playsInline
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const newVolume = volume === 0 ? 0.5 : 0
                                setVolume(newVolume)
                                if (videoRef.current) {
                                    videoRef.current.volume = newVolume
                                }
                            }}
                            className="text-white hover:text-orange-400 transition-colors"
                        >
                            {volume === 0 ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #f97316 0%, #f97316 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                            }}
                        />
                    </div>

                    {/* Live Indicator */}
                    {isLive && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-white">LIVE</span>
                        </div>
                    )}

                    {/* Fullscreen Button */}
                    <button onClick={toggleFullscreen} className="ml-auto text-white hover:text-orange-400 transition-colors">
                        {isFullscreen ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </button>

                    {/* Camera Title and ID */}
                    <div className="text-right">
                        <div className="text-sm font-medium text-white">{title}</div>
                        <div className="text-xs text-gray-400">ID: {cameraId.toUpperCase()}</div>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                <div
                    className={`w-2 h-2 rounded-full ${videoError ? "bg-red-500" : isPlaying ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="text-xs text-white font-medium">{videoError ? "ERROR" : isPlaying ? "ACTIVE" : "PAUSED"}</span>
            </div>
        </div>
    )
}

import React, { useState, useRef, useEffect } from "react"

export function CameraControls({ onControl, disabled = false }) {
    const [activeControl, setActiveControl] = useState(null)
    const [zoomLevel, setZoomLevel] = useState(50)
    const [tiltLevel, setTiltLevel] = useState(50)
    const [panLevel, setPanLevel] = useState(50)
    const intervalRef = useRef(null)

    // Handle continuous control actions
    const startContinuousAction = (action) => {
        if (disabled) return

        setActiveControl(action)
        onControl(action)

        // Continue sending the command every 100ms while pressed
        intervalRef.current = setInterval(() => {
            onControl(action)
        }, 100)
    }

    const stopContinuousAction = () => {
        setActiveControl(null)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        onControl("stop")
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const handleZoomChange = (value) => {
        setZoomLevel(value)

        if (value > 50) {
            onControl("zoom_in", "local_camera_right", value)
        } else if (value < 50) {
            onControl("zoom_out", "local_camera_right", value)
        }
    }

    const handleTiltChange = (value) => {
        setTiltLevel(value)
        if (value > 50) {
            onControl("tilt_up", "local_camera_right", value)
        } else if (value < 50) {
            onControl("tilt_down", "local_camera_right", value)
        }
    }

    const handlePanChange = (value) => {
        setPanLevel(value)
        if (value > 50) {
            onControl("pan_right", "local_camera_right", value)
        } else if (value < 50) {
            onControl("pan_left", "local_camera_right", value)
        }
    }

    const resetPosition = () => {
        setZoomLevel(50)
        setTiltLevel(50)
        setPanLevel(50)
        onControl("reset")
    }

    const ControlButton = ({ action, children, className = "", size = "default" }) => {
        const sizeClasses = {
            small: "w-10 h-10",
            default: "w-12 h-12",
            large: "w-16 h-16",
        }

        return (
            <button
                onMouseDown={() => startContinuousAction(action)}
                onMouseUp={stopContinuousAction}
                onMouseLeave={stopContinuousAction}
                onTouchStart={() => startContinuousAction(action)}
                onTouchEnd={stopContinuousAction}
                disabled={disabled}
                className={`
          ${sizeClasses[size]}
          bg-gray-700 hover:bg-orange-500 active:bg-orange-600
          ${activeControl === action ? "bg-orange-500 ring-2 ring-orange-300" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          rounded-lg border border-gray-600 transition-all duration-150
          flex items-center justify-center text-white font-medium
          shadow-lg hover:shadow-xl active:scale-95
          ${className}
        `}
            >
                {children}
            </button>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Directional Controls - Video Player Style */}
                <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                    <h4 className="text-sm font-semibold text-orange-400 mb-4 text-center">Movement Controls</h4>

                    {/* D-Pad Style Layout */}
                    <div className="relative w-48 h-48 mx-auto">
                        {/* Up */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                            <ControlButton action="move/up" size="large">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>

                        {/* Left */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                            <ControlButton action="move/left" size="large">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>

                        {/* Center - Stop Button */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <button
                                onClick={() => onControl("stop")}
                                disabled={disabled}
                                className={`
                w-16 h-16 bg-red-600 hover:bg-red-700 active:bg-red-800
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                rounded-full border-2 border-red-400 transition-all duration-150
                flex items-center justify-center text-white font-bold
                shadow-lg hover:shadow-xl active:scale-95
              `}
                            >
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Right */}
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                            <ControlButton action="move/right" size="large">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>

                        {/* Down */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                            <ControlButton action="move/down" size="large">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    {/* Tilt Controls */}
                    <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                        <h4 className="text-sm font-semibold text-orange-400 mb-4 text-center">Tilt Control</h4>
                        <div className="flex items-center gap-4">
                            <ControlButton action="tilt_down" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>

                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={tiltLevel}
                                    onChange={(e) => handleTiltChange(Number(e.target.value))}
                                    disabled={disabled}
                                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${tiltLevel}%, #4b5563 ${tiltLevel}%, #4b5563 100%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Down</span>
                                    <span>{tiltLevel}%</span>
                                    <span>Up</span>
                                </div>
                            </div>

                            <ControlButton action="tilt_up" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                        <h4 className="text-sm font-semibold text-orange-400 mb-4 text-center">Zoom Control</h4>
                        <div className="flex items-center gap-4">
                            <ControlButton action="zoom_out" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                    <path fillRule="evenodd" d="M5 8a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </ControlButton>

                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={zoomLevel}
                                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                                    disabled={disabled}
                                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${zoomLevel}%, #4b5563 ${zoomLevel}%, #4b5563 100%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Wide</span>
                                    <span>{zoomLevel}%</span>
                                    <span>Zoom</span>
                                </div>
                            </div>

                            <ControlButton action="zoom_in" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        d="M8 6a1 1 0 011 1v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H6a1 1 0 110-2h1V7a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>
                    </div>

                    {/* Pan Control */}
                    <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                        <h4 className="text-sm font-semibold text-orange-400 mb-4 text-center">Pan Control</h4>
                        <div className="flex items-center gap-4">
                            <ControlButton action="pan_left" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>

                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={panLevel}
                                    onChange={(e) => handlePanChange(Number(e.target.value))}
                                    disabled={disabled}
                                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${panLevel}%, #4b5563 ${panLevel}%, #4b5563 100%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Left</span>
                                    <span>{panLevel}%</span>
                                    <span>Right</span>
                                </div>
                            </div>

                            <ControlButton action="pan_right" size="small">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </ControlButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-orange-400 mb-4 text-center">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={resetPosition}
                        disabled={disabled}
                        className={`
              px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              rounded-lg border border-blue-500 transition-all duration-150
              flex items-center justify-center gap-2 text-white font-medium
              shadow-lg hover:shadow-xl active:scale-95
            `}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Reset
                    </button>

                    <button
                        onClick={() => onControl("preset/home")}
                        disabled={disabled}
                        className={`
              px-4 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              rounded-lg border border-green-500 transition-all duration-150
              flex items-center justify-center gap-2 text-white font-medium
              shadow-lg hover:shadow-xl active:scale-95
            `}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Home
                    </button>
                </div>
            </div>

            {/* Status Display */}
            <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-orange-400 mb-3 text-center">Control Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Active:</span>
                        <span className={`font-medium ${activeControl ? "text-orange-400" : "text-gray-500"}`}>
                            {activeControl || "None"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Connection:</span>
                        <span className={`font-medium ${disabled ? "text-red-400" : "text-green-400"}`}>
                            {disabled ? "Offline" : "Online"}
                        </span>
                    </div>
                </div>
            </div>
        </div >
    )
}

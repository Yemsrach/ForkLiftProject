
import { useRef, useState, useCallback, useEffect } from "react"

export function CustomSlider({ value, min = 0, max = 100, step = 1, onValueChange, className = "" }) {
  const sliderRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const calculateValueFromMouseEvent = useCallback(
    (event) => {
      if (!sliderRef.current) return value

      const rect = sliderRef.current.getBoundingClientRect()
      const clientX = event.clientX
      const offsetX = clientX - rect.left
      let percentage = offsetX / rect.width

      // Clamp percentage between 0 and 1
      percentage = Math.max(0, Math.min(1, percentage))

      // Calculate value based on percentage, min, max, and step
      let newValue = min + percentage * (max - min)
      newValue = Math.round(newValue / step) * step // Snap to step
      newValue = Math.max(min, Math.min(max, newValue)) // Ensure within bounds

      return newValue
    },
    [min, max, step, value],
  )

  const handleMouseDown = useCallback(
    (event) => {
      setIsDragging(true)
      const newValue = calculateValueFromMouseEvent(event)
      if (onValueChange) {
        onValueChange([newValue])
      }
    },
    [calculateValueFromMouseEvent, onValueChange],
  )

  const handleMouseMove = useCallback(
    (event) => {
      if (isDragging) {
        const newValue = calculateValueFromMouseEvent(event)
        if (onValueChange) {
          onValueChange([newValue])
        }
      }
    },
    [isDragging, calculateValueFromMouseEvent, onValueChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className={`custom-slider-container ${className}`}
      onMouseDown={handleMouseDown}
      role="slider"
      aria-valuenow={value[0]}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-orientation="horizontal"
    >
      <div className="custom-slider-fill" style={{ width: `${percentage}%` }}></div>
      <div className="custom-slider-thumb" style={{ left: `${percentage}%` }}></div>
    </div>
  )
}


export function CustomButton({ children, onClick, className = "", disabled = false, "aria-label": ariaLabel }) {
  return (
    <button className={`custom-button ${className}`} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  )
}

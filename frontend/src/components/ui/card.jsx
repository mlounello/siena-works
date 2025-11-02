export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg p-4 border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
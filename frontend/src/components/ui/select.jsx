export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sienagreen focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
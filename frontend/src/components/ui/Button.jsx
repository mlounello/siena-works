export function Button({ children, variant = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sienagreen disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2"

  const variants = {
    default: "bg-sienagreen text-white hover:bg-darkgreen",
    outline: "border border-sienagreen text-sienagreen hover:bg-sienagreen hover:text-white",
    subtle: "bg-gold text-darkgreen hover:bg-yellow-400"
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
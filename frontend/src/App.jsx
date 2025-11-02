import { Outlet, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function App() {
  useEffect(() => {
    // Follow system color scheme automatically
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    updateTheme();
    mq.addEventListener("change", updateTheme);
    return () => mq.removeEventListener("change", updateTheme);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-siena-darkGreen text-siena-white flex flex-col p-6">
        <h2 className="text-siena-gold font-display tracking-wider mb-8 text-xl">
          SienaWorks
        </h2>
        <nav className="flex-1">
          {[
            { path: "/orders", label: "Orders" },
            { path: "/", label: "Departments" },
            { path: "/accounts", label: "Accounts" },
            { path: "/vendors", label: "Vendors" },
          ].map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md mb-2 transition-colors duration-150 ${
                  isActive
                    ? "bg-siena-gold text-siena-darkGreen font-semibold"
                    : "hover:bg-siena-green hover:text-siena-gold"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <footer className="text-xs opacity-70 mt-auto">
          <p>© {new Date().getFullYear()} Siena University</p>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-siena-bg text-siena-darkGreen dark:text-siena-gold p-6">
        <Outlet />
      </main>
      <Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: "#1B4932", // Siena dark green
      color: "#fff",
      fontFamily: "Gudea, sans-serif",
      borderRadius: "8px",
    },
    success: {
      style: { background: "#006B54", color: "#fff" },
      iconTheme: { primary: "#FCC917", secondary: "#fff" },
    },
    error: {
      style: { background: "#B91C1C", color: "#fff" },
      iconTheme: { primary: "#FCC917", secondary: "#fff" },
    },
  }}
/>
    </div>
  );
}
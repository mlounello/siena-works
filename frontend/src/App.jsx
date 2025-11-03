import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "react-hot-toast";
import supabase from "./supabaseClient";
import Login from "./pages/Login";
import LogoutButton from "./components/LogoutButton";

// import your existing pages
import Orders from "./pages/Orders";
import Departments from "./pages/Departments";
import Accounts from "./pages/Accounts";
import Vendors from "./pages/Vendors";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // theme sync
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    updateTheme();
    mq.addEventListener("change", updateTheme);
    return () => mq.removeEventListener("change", updateTheme);
  }, []);

  // Supabase session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Unauthenticated view
  if (!session) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    );
  }

  // Authenticated layout
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 bg-siena-darkGreen text-siena-white flex flex-col p-6">
          <h2 className="text-siena-gold font-display tracking-wider mb-8 text-xl">
            SienaWorks
          </h2>

          <nav className="flex-1">
            {[
              { path: "/orders", label: "Orders" },
              { path: "/departments", label: "Departments" },
              { path: "/accounts", label: "Accounts" },
              { path: "/vendors", label: "Vendors" },
              { path: "/admin", label: "Admin Dashboard" },
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

          <LogoutButton />

          <footer className="text-xs opacity-70 mt-auto">
            <p>© {new Date().getFullYear()} Siena University</p>
          </footer>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white dark:bg-siena-bg text-siena-darkGreen dark:text-siena-gold p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Toaster config */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1B4932",
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
    </Router>
  );
}
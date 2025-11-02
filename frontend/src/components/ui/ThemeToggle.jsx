import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system");

  // Detect initial theme preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // Watch for system changes when set to system mode
  useEffect(() => {
    if (theme === "system") {
      const listener = (e) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme]);

  const toggleTheme = () => {
    const next =
      theme === "light"
        ? "dark"
        : theme === "dark"
        ? "system"
        : "light";

    setTheme(next);
    localStorage.setItem("theme", next);

    if (next === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  const label =
    theme === "system"
      ? "System"
      : theme === "light"
      ? "Light"
      : "Dark";

  return (
    <button
      onClick={toggleTheme}
      className="text-xs mt-2 px-2 py-1 border border-siena-gold rounded hover:bg-siena-gold hover:text-siena-darkGreen transition-colors"
    >
      Theme: {label}
    </button>
  );
}
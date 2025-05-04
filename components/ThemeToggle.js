import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const applyTheme = (theme) => {
    if (theme === "system") {
      document.documentElement.classList.remove("dark", "light");
    } else {
      document.documentElement.classList.add(theme);
      document.documentElement.classList.remove(theme === "dark" ? "light" : "dark");
    }
    localStorage.setItem("theme", theme);
  };

  const cycleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg"
    >
      {theme === "light" ? <SunIcon className="h-6 w-6 text-yellow-500" /> :
       theme === "dark" ? <MoonIcon className="h-6 w-6 text-gray-200" /> :
       <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />}
    </button>
  );
}
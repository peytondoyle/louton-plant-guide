import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
  };

  if (!mounted) return null; // Prevent mismatch during hydration

  return (
    <button
      onClick={cycleTheme}
      className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg"
    >
      {resolvedTheme === "light" ? <SunIcon className="h-6 w-6 text-yellow-500" /> :
       resolvedTheme === "dark" ? <MoonIcon className="h-6 w-6 text-gray-200" /> :
       <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />}
    </button>
  );
}
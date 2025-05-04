import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/globals.css";

function ApplyThemeImmediately() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
      console.log("💡 Applied theme class:", resolvedTheme);
    }
  }, [resolvedTheme]);

  return null;
}

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <ApplyThemeImmediately />
      {mounted ? <Component {...pageProps} /> : <div className="bg-gray-900 text-white min-h-screen"></div>}
    </ThemeProvider>
  );
}

export default MyApp;
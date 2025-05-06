// pages/_app.js
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {mounted ? (
        <Component {...pageProps} />
      ) : (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors" />
      )}
    </ThemeProvider>
  );
}

export default MyApp;
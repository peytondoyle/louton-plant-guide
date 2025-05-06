// pages/_app.js
import { ThemeProvider } from "next-themes";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
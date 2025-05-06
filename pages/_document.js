// pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document";

const setInitialTheme = `
  (function () {
    try {
      const theme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const finalTheme = theme || (systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.add(finalTheme);
    } catch (e) {}
  })();
`;

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
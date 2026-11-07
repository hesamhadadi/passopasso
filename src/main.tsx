/// <reference types="vite/client" />
import { createRoot } from "react-dom/client";
import Reference from "./Reference";
createRoot(document.getElementById("root")!).render(<Reference />);
if (import.meta.env.PROD && "serviceWorker" in navigator)
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.warn);
  });

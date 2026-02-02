import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initStorage } from "./lib/storage";

// Initialize storage (loads from Tauri Store or localStorage) before rendering
initStorage().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

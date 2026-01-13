import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

const isElectron =
 typeof navigator !== "undefined" &&
 typeof navigator.userAgent === "string" &&
 navigator.userAgent.toLowerCase().includes("electron");

if (!isElectron) {
 registerSW({
  immediate: true,
 });
}

createRoot(document.getElementById("root")!).render(<App />);

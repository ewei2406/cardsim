import { createRoot } from "react-dom/client";
import App from "./App.tsx";

document.addEventListener("dragstart", (e) => e.preventDefault());
createRoot(document.getElementById("root")!).render(<App />);

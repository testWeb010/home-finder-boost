import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");
hydrateRoot(rootElement, <App />);

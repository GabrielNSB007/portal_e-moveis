import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { Providers } from "./app/providers";
import "./styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento #root não encontrado.");
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);

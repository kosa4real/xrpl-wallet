import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AccountProvider } from "./contexts/AccountContext.jsx";
import App from "./App.jsx";
import "./index.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AccountProvider>
      <App />
    </AccountProvider>
  </StrictMode>
);

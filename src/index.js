import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AuthProvider from "./AuthContext";
import theme from "./theme.js";
import { ThemeProvider } from "@mui/material";
import { TasksFiltersProvider } from "./components/Tasks/TasksFiltersContext.js";

// No Router here, it should reside in App.js
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <TasksFiltersProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </TasksFiltersProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();

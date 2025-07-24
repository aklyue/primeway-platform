import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import theme from "./theme";
import { ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import store from "./store";
import { TourProvider } from "@reactour/tour";
import AnimatedContentComponent from "./UI/AnimatedContentComponent";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <TourProvider
        steps={[]}
        scrollSmooth={true}
        disableInteraction={true}
        ContentComponent={AnimatedContentComponent}
      >
        <App />
      </TourProvider>
    </ThemeProvider>
  </Provider>
);

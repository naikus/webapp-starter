// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Config from "@config";
import {NotificationProvider} from "@components/notifications";

(() => {
  const faviconElem = document.getElementById("favicon");
  faviconElem && (faviconElem.href = Config.favicon);
  document.title = Config.appName;
})();
// /*
ReactDOM.createRoot(document.getElementById("root"))
    .render(
      <React.StrictMode>
        <NotificationProvider>
          <App appBarPosition="top" />
        </NotificationProvider>
      </React.StrictMode>
    );
// */
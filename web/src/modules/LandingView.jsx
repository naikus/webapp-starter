/* global */
import React, {useCallback, useEffect, useState, useRef} from "react";
import {useRouter} from "@components/router";
import Actions from "@components/actionbar/Actions";
import Overlay from "@components/overlay/Overlay";
import {useNotifications} from "@components/notifications";
import Config from "@config";

function random(max, min = 0) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/** @type {Array<import("@components/notifications").NotificationType>} */
const nTypes = ["success", "info", "warn", "error", "toast"];


/**
 * Adds an escape key listener to close the overlays
 * @param {boolean} show 
 * @param {Function} onCancel 
 */
function useEscapeClose(show, onCancel) {
  const wasShown = useRef(false),
      close = useCallback(e => {
        if(e.key === "Escape") {
          setTimeout(() => {
            onCancel();
          }, 30);
        }
      }, []);

  useEffect(function addKeyListener() {
    if(show) {
      // console.log("Adding listener");
      document.addEventListener("keyup", close);
      wasShown.current = true;
    }else {
      if(wasShown.current) {
        // console.log("Removing listener");
        document.removeEventListener("keyup", close);
        setTimeout(() => {
          onCancel();
        }, 30);
      }
    }

    return () => {
      wasShown.current = false;
      document.removeEventListener("keyup", close);
    }
  }, [show]);
}


const View = props => {
  const {context} = props, 
      notify = useNotifications(),
      router = useRouter(), 
      toggleScheme = useCallback(() => {
        /** @type {HTMLElement} */
        // @ts-ignore
        const root = document.firstElementChild,
            data = root.dataset,
            theme = data.theme;
        if(theme === "light") {
          data.theme = "dark";
        }else {
          data.theme = "light";
        }
      }, []),
      showForm = useCallback(() => {
        router && router.route("/form");
      }, []),
      [showOverlay, setShowOverlay] = useState(false);

  useEscapeClose(showOverlay, () => setShowOverlay(false));

  // @ts-ignore
  console.debug("Router", router.getCurrentRoute()?.params);
  // console.debug("Context", context.queryParams.get("hello"));
  return (
    <div className="view landing-view">
      <style>
        {`
          .landing-view .content {
            display: flex;
            justify-content: center;
            padding-top: 100px;
            position: relative;
          }
          kbd {
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            font-size: 0.8em;
            padding: 4px 6px;
          }
        `}
      </style>
      <Actions target=".app-bar > .actions">
        <button title="Sample Form" className="action" onClick={showForm} aria-label="Sample Form">
          <i className="icon icon-clipboard"></i>
        </button>
        <button title="Show Overlay" className="action"
            onClick={() => setShowOverlay(!showOverlay)} aria-label="Show Overlay">
          <i className="icon icon-eye"></i>
        </button>
        <button title="Toggle Light/Dark Mode" className="action"
            onClick={() => toggleScheme()} aria-label="Toggle Theme">
          <i className="icon icon-sun"></i>
        </button>
        <button title="Show Sample Notification" className="action" onClick={() => {
            notify({
              content: (message) => `This is a ${message.type} message`,
              type: nTypes[random(nTypes.length - 1)],
              sticky: random(1, 0) > 0,
              timeout: 2000
            });
          }} aria-label="Sample Notification">
          <i className="icon icon-bell"></i>
        </button>
      </Actions>
      <div className="content anim">
        <img style={{animationDuration: "10s"}}
          className="spin" src={Config.logo}
          width="140"
          height="140"
          alt="logo" />
      </div>
      <Overlay className={`top modal alert`}
          show={showOverlay}
          onClose={() => {
            notify({
              type: "info",
              content: "Overlay onClose callback",
              timeout: 700
            });
          }}>
        <div className="title">
          <h4><i className="icon icon-alert-circle" /> Alert!</h4>
        </div>
        <div className="content">
          This is a sample alert message. You can close this by clicking the close button 
          below or by pressing the <kbd>Esc</kbd> key.
        </div>
        <div className="actions">
        <button className="inline">Dummy Button</button>
          <button className="primary inline" onClick={() => setShowOverlay(!showOverlay)}>Close</button>
        </div>
      </Overlay>
    </div>
  );
};
View.displayName = "LandingView";

export default View;

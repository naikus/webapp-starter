import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useNotificationService} from "./Context";
import "./style.less";

/**
 * @typedef {import("./index").NotificationMessage} NotificationMessage
 * @typedef {import("./index").NotificationService} NotificationService
 */

/**
 * 
 * @param {{
 *  message: NotificationMessage,
 *  onDismiss: Function
 *  children?: any
 * }} props 
 */
const Notification = props => {
  const {message} = props,
      {timeout = 3000, sticky = false, type = "toast", position = "bottom", content} = message,
      [show, setShow] = useState(false),
      /** @type {import("react").MutableRefObject} */
      stickyTimer = useRef(null),
      onDismiss = e => {
        e && e.stopPropagation();
        clearTimeout(stickyTimer.current);
        setShow(false);
        props.onDismiss && props.onDismiss();
      };

  useEffect(function show() {
    const delay = setTimeout(() => {
      setShow(true);
    }, 50);

    if(!sticky) {
      stickyTimer.current = setTimeout(() => {
        onDismiss();
      }, timeout);
    }

    return () => {
      clearTimeout(delay);
      clearTimeout(stickyTimer.current);
    };
  }, []);

  return (
    <div className={`notification ${type} ${position} ${show ? "show" : ""}`} onClick={onDismiss}>
      {typeof (content) === "function" ? content(message) : content}
    </div>
  );
};
Notification.displayName = "Notification";
Notification.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onDismiss: PropTypes.func
};

/**
 * @param {*} props 
 */
const Notifications = props => {
  const {onCurrent, next} = useNotificationService(),
      // @ts-ignore
      [current, setCurrent] = useState(null),
      // {current, next} = notifications,
      /** @type {{current: any}} */
      timer = useRef(null),
      onDismiss = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          next();
        }, 200);
      },
      notification = current ?
        // @ts-ignore "current" will not be null
        <Notification key={current.key} message={current.message} onDismiss={onDismiss} /> : 
        null;

  useEffect(function setCurrentMessage() {
    const unsub = onCurrent(message => {
      // @ts-ignore
      setCurrent(message);
    });
    () => {
      unsub();
    };
  }, []);

  return (
    <div className="notifications">
      {notification}
    </div>
  );
};
export default Notifications;
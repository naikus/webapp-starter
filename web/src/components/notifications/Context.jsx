import React from "react";

/**
 * @typedef {import(".").NotificationService} NotificationService
 * @typedef {import("react").Context<NotificationService>} NotificationContext
 */

/**
 * @type {NotificationContext}
 */
// @ts-ignore
const NotificationServiceContext = React.createContext(/* @type {NotificationService} */{
  show(message) {},
  next() {},
  onCurrent(callback) {
    return () => {};
  }
});

const useNotificationService = () => React.useContext(NotificationServiceContext);

export {
  NotificationServiceContext,
  useNotificationService
};

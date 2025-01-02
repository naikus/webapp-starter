import {NotificationServiceContext, useNotificationService} from "./Context";
import NotificationProvider from "./Provider";
import Notifications from "./Notifications";

/**
 * @typedef {"toast" | "info" | "success" | "warn" | "error"} NotificationType
 * @typedef {"bottom" | "top"} NotificationPosition
 */

/**
 * @typedef NotificationMessage
 * @property {NotificationType} type
 * @property {string} [message]
 * @property {string | JSX.Element | function} [content]
 * @property {NotificationPosition} [position="bottom"]
 * @property {number} [timeout=0]
 * @property {boolean} [sticky=false]
 * @property {() => void} [onDismiss]
 */

/**
 * @typedef NotificationService
 * @property {(message: NotificationMessage) => void} show
 * @property {() => void} next
 * @property {(cb: (message: NotificationMessage) => void) => function} onCurrent The onCurrent handler
 */

/**
 * @typedef Notify
 * @property {(message?: string | JSX.Element | function) => void} info
 * @property {(message?: string | JSX.Element | function) => void} success
 * @property {(message?: string | JSX.Element | function, sticky?: boolean) => void} warn
 * @property {(message?: string | JSX.Element | function, sticky?: boolean) => void} error
 * @property {(message?: string | JSX.Element | function, sticky?: boolean) => void} toast
 */

/**
 * @typedef {((message: NotificationMessage) => void) & Notify} NotifyFunction
 */

/**
 * @returns {NotifyFunction}
 */
function useNotifications() {
  const service = useNotificationService();

  /**
   * @type {NotifyFunction}
   */
  function notify(message) {
    service.show(message);
  }

  /**
   * Show info message
   * @param {string | JSX.Element | function} content 
   */
  notify.info = (content) => {
    notify({
      type: "info",
      content
    });
  };
  /**
   * Show success message
   * @param {string | JSX.Element | function} content 
   */
  notify.success = (content) => {
    notify({
      type: "success",
      content
    });
  };
  /**
   * Show warning message
   * @param {string | JSX.Element | function} content 
   * @param {boolean} [sticky]
   */
  notify.warn = (content, sticky) => {
    notify({
      type: "warn",
      sticky,
      content
    });
  };
  /**
   * Show error message
   * @param {string | JSX.Element | function} content 
   * @param {boolean} [sticky]
   */
  notify.error = (content, sticky) => {
    notify({
      type: "error",
      sticky,
      content
    });
  };
  /**
   * Show a toast message
   * @param {string | JSX.Element | function} content 
   */
  notify.toast = (content) => {
    notify({
      type: "toast",
      content
    });
  };
  // @ts-ignore
  return notify;
}

export {
  useNotifications,
  NotificationServiceContext,
  NotificationProvider,
  Notifications
};
import PropTypes from "prop-types";
import {NotificationServiceContext} from "./Context";

/**
 * @typedef {import("./index").NotificationMessage} NotificationMessage
 * @typedef {import("./index").NotificationService} NotificationService
 */


/**
 * Creates a notification service
 * @returns {NotificationService}
 */
function createNotificationService() {
  let current, handler;
  const messages = [],
      next = () => {
        if(messages.length) {
          setCurrent({
            key: new Date().getTime(),
            message: messages.shift()
          });
        }else {
          setCurrent(null);
        }
      },

      /**
       * @param {NotificationMessage} message
       */
      enqueue = message => {
        messages.push(message);
        if(!current) {
          next();
        }
      },

      /**
       * @param {NotificationMessage} message
       */
      setCurrent = message => {
        current = message;
        handler && handler(message);
      };

  return {
    onCurrent: cb => {
      handler = cb;
      return () => {
        handler = null;
      };
    },
    show: enqueue,
    next
  };
}

/**
 * 
 * @param {{
 *   children: any
 * }} props 
 * @returns {JSX.Element}
 */
const NotificationProvider = props => {
  const {children} = props,
      notifications = createNotificationService();

  return (
    <NotificationServiceContext.Provider value={notifications}>
      {children}
    </NotificationServiceContext.Provider>
  );
};
NotificationProvider.displayName = "NotificationProvider";
NotificationProvider.propTypes = {
  children: PropTypes.node
};

export default NotificationProvider;
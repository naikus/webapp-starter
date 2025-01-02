/* global */

/**
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn
 * @typedef {import("app-context/types").AppContextModule} AppContextModule
 * @typedef {import("./config").Config} Config
 * @typedef {import("app-context/lib/namespaced-emitter").EventListener} EventListener
 */

/**
 * @typedef App
 * @property {function} start The start of the applicatino
 */

/** @type {AppContextModule} */
const appContextModule = require("app-context"),
    logger = require("./util/logger")("Application"),
    config = require("./config"),
    // various services and modules
    webserver = require("./webserver"),
    about = require("./about"),
    apiDocs = require("./api-docs");

/**
 * Application is the starting point. Registers a web server and other services (presence, meeting)
 * etc. that depend on the web server
 * @param {Config} config The application config
 * @return {App}
 */
function application(config) {
  /** @type {AppContext} */
  const context = appContextModule.create();
  // context.config = config;
  context.on(
    "context:init-module",
    /** @type {EventListener} */
    ({name}) => {
      logger.info("Module '%s' initialized", name);
    }
  );
  return {
    async start() {
      Promise.all([
        context.register({
          name: "config",
          initialize: () => config
        }),
        context.register(about),
        context.register(webserver),
        context.register(apiDocs)
      ]).then(() => logger.info("Application started 🚀"));
    }
  };
}

const app = application(config);
app.start();

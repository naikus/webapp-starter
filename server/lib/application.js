/* global */

/**
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn

 * @typedef {import("./config").Config} Config
 * @typedef {import("app-context/lib/namespaced-emitter").EventListener} EventListener
 */

/**
 * @typedef App
 * @property {function} start The start of the applicatino
 */

const AppContext = require("app-context"),
    logger = require("./util/logger")("Application"),
    config = require("./config"),
    // various services and modules
    webserver = require("./webserver"),
    about = require("./about"),
    persistence = require("./persistence");

/**
 * Application is the starting point. Registers a web server and other services (presence, meeting)
 * etc. that depend on the web server
 * @param {Config} config The application config
 * @return {App}
 */
function application(config) {
  /** @type {AppContext} */
  const context = AppContext.create();
  // context.config = config;
  context.on("context:init-module", /** @type {EventListener} */({name}) => {
    logger.info("Module '%s' initialized", name);
  });
  return {
    start() {
      context.register(about)
        .register(webserver)
        .register(persistence)
        .register({
          name: "config",
          initialize: () => config
        });

      context.start()
        .then(() => {
          logger.info("Application started 🚀");
          context.emit("app:initialize");
        })
        .catch(e => {
          logger.error("Application failed to start", e);
          process.exit(1);
        });

      process.on("SIGTERM", async () => {
        context.emit("app:shutdown");
        process.exit(0);
      });
      process.on("SIGINT", async () => {
        context.emit("app:shutdown");
        process.exit(0);
      });
    }
  };
}

const app = application(config);
app.start();

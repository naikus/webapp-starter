/**
 * @typedef {import("./service").AboutService} AboutService
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn
 * @typedef {import("../webserver/types").Webapp} Webapp
 * @typedef {import("../types").Config} Config
 */

const routes = require("./routes"),
    Service = require("./service");

/**
* @type {ModuleDefn}
*/
module.exports = {
  name: "about",
  async initialize(context) {
    /** @type {[Config, Webapp]} */
    const [config, webServer] = await context.dependency(["config", "webserver"]);

    webServer.registerApi(routes, {service: Service, config});
    return Service;
  }
};
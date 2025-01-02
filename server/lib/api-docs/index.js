/**
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn
 * @typedef {import("../webserver/types").Webapp} Webapp
 * @typedef {import("../types").Config} Config
 */

const swagger = require("@fastify/swagger"),
    scalar = require("@scalar/fastify-api-reference"),
    prefix = "/api-docs";

/** @type {ModuleDefn} */
module.exports = {
  name: "apidocs",
  async initialize(appContext) {
    const
        /** @type {[Config, Webapp]} */
        [config, webServer] = await appContext.dependency(["config", "webserver"]),

        // We don't need the api server here (with apiPath prefix) for docs
        httpServer = webServer.server;

    httpServer.register(swagger, {
      swagger: {
        info: {
          title: "Sample API",
          description: "The API for Sample service.",
          version: "1.0"
        },
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
          {name: "MyService", description: "My Service API"}
        ]
      }
    }).register(scalar, {
      // @ts-ignore
      routePrefix: prefix,
      // @ts-ignore
      configuration: {
        spec: {
          content: () => httpServer.swagger()
        }
      }
    });
  }
};

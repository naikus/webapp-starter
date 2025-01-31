/**
 * @typedef {import("fastify").FastifyInstance} FastifyInstance
 * @typedef {import("../types").Config} Config;
 * @typedef {import("../webserver/types").Webapp} Webapp
 * @typedef {import("./service").AboutService} AboutService
 */

/**
 * Register routes for About
 * @param {FastifyInstance} api The fastify instance
 * @param {{
 *  service: AboutService,
 *  config: Config
 * }} opts The options for this router registration
 */
module.exports = async function about(api, opts) {
  const {service/*, config*/} = opts;

  // use config in some way
  // console.debug("schemas", api.getSchemas());
  // api.addSchema();

  api.get("/about", {
    schema: {
      response: {
        200: {
          id: "About",
          type: "object",
          properties: {
            name: {type: "string"},
            version: {type: "string"},
            date: {type: "object"}
          }
        }
      }
    },
    handler: (req, rep) => {
      rep.send({
        name: service.getAppName(),
        version: service.getVersion(),
        date: new Date()
      });
    }
  });
};

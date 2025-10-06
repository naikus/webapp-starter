/**
 * @typedef {import("fastify").FastifyInstance} FastifyInstance
 * @typedef {import("fastify").FastifyPluginOptions} PluginOpts
 */

/**
 * @param {FastifyInstance} server
 * @para {PluginOpts} opts
 */
module.exports = async function(server, {config}) {
  server.get("/status", {
    schema: {
      tags: ["HealthCheck"]
    },
    handler(req, rep) {
      rep.send({
        status: "ok"
      });
    }
  });
  server.get("/about", {
    schema: {
      tags: ["About"]
    },
    handler(req, rep) {
      rep.send({
        version: config.version,
        description: config.description
      });
    }
  });
};
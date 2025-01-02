/**
 * @typedef {import("fastify").FastifyInstance} FastifyInstance
 * @typedef {import("fastify").FastifyPluginOptions} PluginOpts
 */

/**
 * @param {FastifyInstance} server
 * @para {PluginOpts} opts
 */
module.exports = async function(server/*, opts */) {
  server.get("/status", (req, rep) => {
    rep.send({
      status: "ok"
    });
  });
};
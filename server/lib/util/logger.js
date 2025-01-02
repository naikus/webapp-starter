/**
 * @typedef {import("pino").Logger} Logger
 */

const {pino} = require("pino"),
    config = require("../config"),
    logger = pino(config.logger);

/**
 * Creates a logger
 * @param {string} name
 * @return {Logger}
 */
module.exports = name => {
  return logger.child({name});
};

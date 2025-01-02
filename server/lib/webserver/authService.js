const logger = require("../util/logger")("Webserver");

/** @typedef {import("../types").Config} Config */

/**
 * @typedef AuthService
 * @property {(token: string) => Promise<boolean>} verifyToken
 */

/**
 * Creates a new authentication service
 * @param {Config} config The application configuration
 * @return {AuthService} The authentication service
 */
function createAuthService(config) {
  const {webapp: {auth}} = config;
  if(!auth || auth.type === "none") {
    logger.warn("Authentication is disabled");
  }

  /**
   * Verify access token
   * @param {string} accessToken
   * @return {Promise<boolean>} true
   */
  async function verifyToken(accessToken) {
    return await true;
  }

  return {
    verifyToken
  };
}

module.exports = {
  create: createAuthService
};

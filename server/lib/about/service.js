/**
 * @typedef AboutService
 * @property {() => string} getAppName
 * @property {() => string} getVersion
 */

/** @type {AboutService} */
module.exports = {
  getAppName() {
    return "Webapp Starter";
  },
  getVersion() {
    return "1.0.0";
  }
};
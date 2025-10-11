/** @typedef {import("./types").Config} Config */

const // os = require("os"),
    pkg = require("../package.json"),
    {env} = process,
    knexfile = require("../db/knexfile"),
    knexConfig = knexfile[env.NODE_ENV || "development"];

/** @type {Config} */
module.exports = {
  version: pkg.version,
  description: pkg.description,

  webserver: {
    host: env.HOST || "0.0.0.0",
    port: env.PORT || 8000,

    ssl: {
      enabled: env.SSL === "true",
      key: env.SSL_KEY_PATH || `${__dirname}/../certs/server.key`,
      cert: env.SSL_CERT_PATH || `${__dirname}/../certs/server.crt`
    },

    // helmet configuration
    security: {
      contentSecurityPolicy: {
        directives: {
          "default-src": [
            "'self'",
            // Other external API servers that UI contacts directly
            // `https://${env.API_SERVER}`,
            // `wss://${env.API_SERVER}`,
            "http://localhost:8000",
            "https://localhost:8000"
          ],
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src":  ["'self'", "'unsafe-inline'"],
          "font-src":   ["'self'", "https://fonts.gstatic.com"],
          "media-src":  ["*"],
          "img-src":  ["*"],
          // "img-src":  ["'self'", "data:", "https://s.gravatar.com/"],
          upgradeInsecureRequests: null
        }
      },
      // This is a workaround for auth0 'popup authentication' to work
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false
      // contentSecurityPolicy: false
    }
    /*
    cors: {
      origin: env.CORS_ORIGIN || "*",
      credentials: env.CORS_CREDENTIALS === "true"
    }
    */
  },

  webapp: {
    apiPath: "/api",
    staticPath: `${process.cwd()}/public`,
    // staticPath: null, // API and webapp are deployed separately
    auth: {
      type: process.env.AUTH_TYPE || "none"
      // Required for secure session for auth.type == "userpass"
      // ,sessionKey: Buffer.from(process.env.SESSION_KEY || "cafebabe".repeat(8), "hex")
    }
  },

  /** @type {import("knex/types").knex.Knex.Config} */
  persistence: knexConfig,

  logger: {
    targets: [
      {
        level: env.LOG_LEVEL || "info"
      }
    ]
  }
};

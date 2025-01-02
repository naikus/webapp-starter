export type Config = {
  /** The webserver configuration */
  webserver: {
    /** The host to bind to */
    host: string;
    /** The port to bind to */
    port: number;
    /** SSL configuration */
    ssl: {
      /** Whether to enable SSL */
      enabled: boolean;
      /** The SSL certificate file */
      cert: string;
      /** The SSL key file */
      key: string;
    };
    /** Security configuration for helmet */
    security: any;
    /** Whether to enable webserver logging */
    logging: boolean;
    /** The webserver logging level */
    security: import("helmet").HelmetOptions;
  };
  /** Web application configuration */
  webapp: {
    /** The base path for all APIs */
    apiPath: string;
    /** The path to the static files */
    staticPath: string;
    /** Authentication configuration */
    auth: {
      /** The authentication type e.g oauth, userpass, etc. */
      type: "oauth" | "none";
      /** The auth configuation for the type is in "auth.type" property */
      [key: string]: any;
    };
  };
  /** The logger configuration */
  logger: import("log4js").Configuration;
};
/**
 * @typedef {import("fastify").FastifyInstance} FastifyInstance
 * @typedef {import("fastify").FastifyPluginOptions} PluginOpts
 * @typedef {import("fastify").onRequestHookHandler} RequestHandler
 */
/**
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn
 * @typedef {import("../config").Config} Config
 * @typedef {import("./types").Webapp} Webapp
 * @typedef {import("./authService").AuthService} AuthService
 */

const fs = require("fs"),
    Fastify = require("fastify"),
    cors = require("@fastify/cors"),
    helmet = require("@fastify/helmet"),
    formBody = require("@fastify/formbody"),
    multipart = require("@fastify/multipart"),
    staticFileServer = require("@fastify/static"),
    // websocket = require("fastify-websocket"),
    logger = require("../util/logger")("Webserver"),
    Auth = require("./authService"),
    serverRoutes = require("./routes");

/**
 * Creates a new application
 * @param {Config} config The application configuration
 * @return {Promise<FastifyInstance>} The fastify instance
 */
async function createWebServer(config) {
  const {webserver: {ssl: {enabled: sslEnable, key: keyPath, cert: certPath}, security}, webapp} = config,
      serverOpts = {
        // logger: false,
        ///*
        logger: {
          level: "debug"
        },
        //*/
        http2: false
      };

  if(sslEnable) {
    [keyPath, certPath].forEach(file => {
      if(!fs.existsSync(file)) {
        logger.info("%s certificate file does not exist", file);
        process.exit(-1);
      }
    });
    // @ts-ignore
    serverOpts.https = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }

  /* @type {import('fastify').FastifyInstance} Instance of Fastify */
  // eslint-disable-next-line new-cap
  const fastify = Fastify(serverOpts),
      {staticPath} = webapp;

  if(staticPath) {
    // console.log(staticPath);
    fastify.register(staticFileServer, {
      root: staticPath,
      prefix: "/app"
    });
  }

  fastify.register(cors, {
    origin: "*"
  })
    // .after(pluginLoadedLogger("cors"))
    .register(helmet, security)
    .register(formBody, {})
    .register(multipart, {})
    // .register(websocket, {options: {maxPayload: 1048576}})
    .register((webserver, opts, done) => {
      webserver.get("/", (req, rep) => {
        rep.redirect("/app/");
      });
      done();
    });
  return fastify;
}

/**
 * Creates a server module that other modules and add as a dependency
 * @param {FastifyInstance} webserver Fastify server instance
 * @param {Config} config Application configuration
 * @return {Webapp} The server module
 */
function createServerModule(webserver, config) {
  const
      /** @type {AuthService} */
      authService = Auth.create(config),
      {webapp: {auth, apiPath}} = config,
      // eslint-disable-next-line valid-jsdoc
      /** @type {RequestHandler} */
      authHook = async (req, rep) => {
        const {headers: {authorization = ""}} = req,
            token = authorization.substring("Bearer ".length);
        try {
          await authService.verifyToken(token);
        }catch(err) {
          rep.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "Invalid access token"
          });
        }
      };

  /** @satisfies {Webapp} */
  return {
    server: webserver,
    async registerApi(apiReg, options = {}) {
      // API plugin where all the api routes are added
      const {requiresAuth = true} = options;
      await webserver.register(
        async (apiServer/*, opts*/) => {
          const authEnabled = auth.type !== "none";
          if(authEnabled && requiresAuth) {
            await apiServer.addHook("onRequest", authHook);
          }
          apiReg(apiServer, options);
        },
        {
          prefix: options.prefix || apiPath
        }
      );
    }
  };
}

/**
 * The web server module
 * @typedef {ModuleDefn}
 */
module.exports = {
  name: "webserver",
  /**
   * Intializes the web server module and returns a Webapp instance. This is exposed as a context
   * module. Other modules and include this as a dependency and use the server instance
   * or the registerApi method to register routes.
   * @example
   * module.exports = {
   *   name: "mymod",
   *   async initialize(appContext) {
   *     const {config} = appContext,
   *         [webServer] = await appContext.dependency("webserver"),
   *         service = Service.create(config);
   *
   *     webServer.registerApi(routes, {myServcice: service, config});
   *     return {
   *       //...
   *     };
   *   }
   * };
   * @param {AppContext} context The application context
   * @return {Promise<Webapp>} The web server module
   */
  async initialize(context) {
    /** @type {[Config]} */
    const [config] = await context.dependency("config"),
        // {config} = context,
        server = await createWebServer(config),
        serverModule = createServerModule(server, config),
        {webserver: {host, port}} = config;

    // Register the application server specific routes. e.g. /status, etc.
    server.register(serverRoutes);
    await server.listen({port, host}, (err, address) => {
      if(err) {
        server.log.error(err);
        process.exit(1);
      }
      // logger.info(`Web server started on ${address}`);
    });

    return serverModule;
  }
};

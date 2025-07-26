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
 */
const fs = require("fs"),
    Fastify = require("fastify"),
    cors = require("@fastify/cors"),
    helmet = require("@fastify/helmet"),
    formBody = require("@fastify/formbody"),
    multipart = require("@fastify/multipart"),
    swagger = require("@fastify/swagger"),
    staticFileServer = require("@fastify/static"),
    // websocket = require("fastify-websocket"),
    logger = require("../util/logger")("Webserver"),
    serverRoutes = require("./routes");

/**
 * Creates and sets up the web server
 * @param {Config} config The application configuration
 * @return {FastifyInstance} The fastify instance
 */
function createWebServer(config) {
  const {webserver: {ssl: {enabled: sslEnable, key: keyPath, cert: certPath}, security}, webapp} = config,
      serverOpts = {
        // logger: false,
        ///*
        logger: {
          level: "info"
        },
        //*/
        http2: true
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
  });
  // fastify.after(pluginLoadedLogger("cors"))
  fastify.register(helmet, security);
  fastify.register(formBody, {});
  fastify.register(multipart, {});
  // fastify.register(websocket, {options: {maxPayload: 1048576}})
  fastify.register((webserver, opts, done) => {
    webserver.get("/", (req, rep) => {
      rep.redirect("/app/");
    });
    done();
  });

  setupApiDocs(fastify, config);
  /*
  fastify.after(() => {
    console.log(fastify.printPlugins());
  });
  */
  return fastify;
}

/**
 * @param {FastifyInstance} webserver
 * @param {Config} config
 */
function setupApiDocs(webserver, config) {
  const {webapp: {apiPath}} = config;
  // @ts-ignore
  webserver.register(swagger, {
    // Gives a meaningful id to schema objects whenever possible instead of def-<number>
    refResolver: {
      // @ts-ignore
      buildLocalReference (json, baseUri, fragment, i) {
        if(!json.title && json.$id) {
          json.title = json.$id;
        }
        return json.$id;
      }
    },
    swagger: {
      info: {
        title: "Webapp Starter API",
        description: "API for Webapp Starter.",
        version: "1.0"
      },
      consumes: ["application/json"],
      produces: ["application/json"]
      /*
      tags: [
        {name: "About", description: "About Dashkit"},
        {name: "HealthCheck", description: "Health status check"}
      ]
      */
    }
  }).register(import("@scalar/fastify-api-reference"), {
    // @ts-ignore
    routePrefix: "/api-docs",
    // @ts-ignore
    configuration: {
      theme: "alternate",
      metaData: {
        title: "Webapp Starter API Docs"
      },
      spec: {
        content: () => webserver.swagger()
      }
    }
  });
}

/**
 * Creates a server module that other modules and add as a dependency
 * @param {FastifyInstance} webserver Fastify server instance
 * @param {Config} config Application configuration
 * @return {Promise<Webapp>} The server module
 */
async function createServerModule(webserver, config) {
  const {webapp: {apiPath}} = config;
  /** @type {FastifyInstance} */
  let apiServer;
  await webserver.register(
    (apiRoot, opts) => {
      apiServer = apiRoot;
    },
    {prefix: apiPath}
  );

  /** @satisfies {Webapp} */
  return {
    get server() {
      return webserver;
    },
    async addApiHook(step, hook) {
      apiServer.addHook(step, hook);
    },
    async registerApi(apiReg, options = {}) {
      apiReg(apiServer, options);
      /*
      apiServer.register(apiReg, {
        prefix: apiPath,
        ...options
      });
      */
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
        serverModule = await createServerModule(server, config),
        {webserver: {host, port}} = config;

    // Register the application server specific routes. e.g. /status, etc.
    server.register(serverRoutes);

    context.on("app:initialize", () => {
      server.listen({port, host}, (err/*, address*/) => {
        if(err) {
          server.log.error(err);
          process.exit(1);
        }
        // logger.info(`Web server started on ${address}`);
      });
    });

    return serverModule;
  }
};

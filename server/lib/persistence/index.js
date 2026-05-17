/**
 * @typedef {import("knex/types").knex.Knex} Knex
 * @typedef {import("../types").Config} Config
 * @typedef {import("app-context/types").AppContext} AppContext
 * @typedef {import("app-context/types").ModuleDefn} ModuleDefn
 */

const knex = require("knex"),
    logger = require("../util/logger")("persistence");

/** @type {ModuleDefn} */
module.exports = {
  name: "persistence",
  /**
   * Initializes the persistence module
   * @param {AppContext} context The application context
   * @return {Promise<Knex>} The database connection
   */
  async initialize(context) {
    /** @type {[Config]} */
    const [config] = await context.dependency("config"),
        {persistence: dbConfig} = config,
        /** @type {Knex} */
        db = knex(dbConfig);

    /*
    logger.info("Database initialized", dbConfig);
    db("webapp_migrations").select("*").then(migrations => {
      logger.info("Migrations %o", migrations);
    });
    */

    // Shutdown the database when the application is shutting down
    context.on("app:shutdown", async () => {
      logger.info("Shutting down database...");
      await db.destroy();
    });

    return db;
  }
};

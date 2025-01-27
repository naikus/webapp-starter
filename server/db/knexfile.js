// Update with your config settings.

const dbName = "webapp";

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: process.env.DB_PATH || `${__dirname}/${dbName}.sqlite3`
    },
    seeds: {
      directory: process.env.DB_SEEDS || `${__dirname}/seeds`
    },
    migrations: {
      tableName: `${dbName}_migrations`
    },
    useNullAsDefault: true
  }
};
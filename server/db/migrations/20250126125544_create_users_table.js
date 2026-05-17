/** @typedef {import("knex").Knex} Knex */

/**
 * @param {Knex} knex
 * @return {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("full_name").notNullable();
    table.string("password").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param {Knex} knex
 * @return {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.dropTable("users");
};

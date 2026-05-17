/** @typedef {import("knex").Knex} Knex */

/**
 * @param {Knex} knex
 * @return {Promise<void>}
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {
      email: "admin@example.com",
      full_name: "Admin User",
      password: "password"
    }
  ]);
};

/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.text('bio').defaultTo('');
        table.timestamps(true, true);
    });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
    await knex.schema.dropTable('users');
}

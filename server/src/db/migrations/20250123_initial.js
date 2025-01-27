export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('query_history', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users');
    table.text('query').notNullable();
    table.timestamp('executed_at').notNullable();
    table.string('status').notNullable();
    table.text('error_message');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('query_history');
  await knex.schema.dropTable('users');
};

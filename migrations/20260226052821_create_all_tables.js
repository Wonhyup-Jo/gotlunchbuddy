/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (t) => {
      t.string('id').primary();
      t.string('password_hash').notNullable();
      t.text('avatar_config').defaultTo('{}');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('teams', (t) => {
      t.string('team_id').primary();
      t.string('team_name').notNullable();
      t.string('operator_user_id').notNullable().references('id').inTable('users');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('invite_links', (t) => {
      t.string('invite_token').primary();
      t.string('team_id').notNullable().references('team_id').inTable('teams');
      t.string('created_by').notNullable().references('id').inTable('users');
      t.timestamp('expires_at').nullable();
      t.boolean('is_active').defaultTo(true);
    })
    .createTable('memberships', (t) => {
      t.string('team_id').notNullable().references('team_id').inTable('teams');
      t.string('user_id').notNullable().references('id').inTable('users');
      t.string('role').notNullable().defaultTo('member');
      t.string('status').notNullable().defaultTo('pending');
      t.timestamp('requested_at').defaultTo(knex.fn.now());
      t.timestamp('decided_at').nullable();
      t.unique(['team_id', 'user_id']);
    })
    .createTable('statuses', (t) => {
      t.string('team_id').notNullable().references('team_id').inTable('teams');
      t.string('user_id').notNullable().references('id').inTable('users');
      t.string('text', 40).defaultTo('');
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.primary(['team_id', 'user_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('statuses')
    .dropTableIfExists('memberships')
    .dropTableIfExists('invite_links')
    .dropTableIfExists('teams')
    .dropTableIfExists('users');
};

const path = require('path');

module.exports = {
  client: 'better-sqlite3',
  connection: {
    filename: path.join(__dirname, 'data', 'gotlunchbuddy.sqlite3')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations')
  }
};

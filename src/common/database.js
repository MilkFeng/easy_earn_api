const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./src/database/users.db');

module.exports = { db };
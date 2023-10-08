const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const secretKey = 'your_secret_key';

// 创建SQLite数据库连接
const db = new sqlite3.Database('./src/database/users.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`);

// 使用本地策略进行身份验证
passport.use(new LocalStrategy((username, password, done) => {
    // 查询数据库以验证用户名
    db.get('SELECT id, username, password FROM users WHERE username = ?', username, (err, user) => {

      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { msg: 'Incorrect username' });
      }
      // 验证密码
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return done(err);
        }
        if (!result) {
          return done(null, false, { msg: 'Incorrect password' });
        }
        return done(null, user);
      });
    });
}));
  
  // 序列化和反序列化用户对象
passport.serializeUser((user, done) => {
    done(null, user.id); // 假设用户数据中有一个唯一的ID字段
});
  
passport.deserializeUser((id, done) => {
// 查询数据库以获取用户信息
    db.get('SELECT id, username, password FROM users WHERE id = ?', id, (err, user) => {
      if (err) {
        return done(err);
      }
      done(null, user);
    });
});

module.exports = { passport, secretKey, db };


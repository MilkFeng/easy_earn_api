const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('./database.js');

const secretKey = 'your_secret_key';

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

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey, // 与生成令牌时使用的密钥一致
};

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  // 在这里验证 JWT 令牌，并在验证成功时调用 done
  // jwtPayload 包含解码后的令牌信息

  // 示例中的验证逻辑可能是：
  // 1. 验证令牌是否过期
  // 2. 验证令牌的签名是否有效

  // 这里假设你的用户信息存储在数据库中，你需要使用 jwtPayload 中的信息查询用户
  // 以下示例假设你的用户模型中有一个 id 字段用于标识用户
  const userId = jwtPayload.userId;
  const username = jwtPayload.username;

  // 查询数据库以获取与令牌相关联的用户信息
  db.get('SELECT * FROM users WHERE id = ?', userId, (err, user) => {
    if(err) return done(err, false);
    if(!user) return done(null, false);
    if(user.username != username) return done(null, false);

    // 如果验证成功，将用户信息传递给路由处理程序
    return done(null, user);
  });
}));


const sign = (user, opt) => {
  return jwt.sign(user, secretKey, opt);
}

module.exports = { passport, sign };
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 创建SQLite数据库连接
const db = new sqlite3.Database('./src/database/users.db');

// 使用本地策略进行身份验证
passport.use(new LocalStrategy((username, password, done) => {
    // 查询数据库以验证用户名
    db.get('SELECT * FROM users WHERE username = ?', username, (err, user) => {
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
    db.get('SELECT * FROM users WHERE id = ?', id, (err, user) => {
      if (err) {
        return done(err);
      }
      done(null, user);
    });
});  

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // 检查用户名是否已存在
  db.get('SELECT * FROM users WHERE username = ?', username, (err, existingUser) => {
    if (err) {
      // 处理数据库查询错误
      return res.status(500).send({msg: 'Internal Server Error'});
    }
    
    if (existingUser) {
      // 用户名已存在
      return res.status(400).send({msg:'Username already exists'});
    }

    // 用户名可用，将密码哈希存储到数据库
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          // 处理密码哈希错误
          return res.status(500).send({ msg: 'Internal Server Error' });
        }
      
        // 插入新用户记录到数据库，不需要指定 id
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
          if (err) {
            // 处理数据库插入错误
            return res.status(500).send({ msg: 'Internal Server Error'});
          }
      
          // 注册成功
          return res.status(200).send({ msg: 'Registion Success' });
        });
    });     
  });
});

// 用户登录路由，生成令牌
router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        
        if (err) {
            return res.status(500).send({ msg: 'Internal Server Error' });
        }
        if (!user) {
            // 身份验证失败，返回自定义消息
            return res.status(401).send(info);
        }

        // 生成 JWT 令牌
        const token = jwt.sign({ userId: user.id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });
      
        // 返回令牌给客户端
        return res.status(200).send({ token: token });
    })(req, res);
});

module.exports = router;


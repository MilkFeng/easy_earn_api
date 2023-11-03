const express = require('express');
const { passport, sign, db } = require('./common/passport.js');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // 检查用户名是否已存在
  db.get('SELECT id, username, password FROM users WHERE username = ?', username, (err, existingUser) => {
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
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  // 身份验证成功，生成 JWT 令牌
  const token = sign({ userId: req.user.id, username: req.user.username }, { expiresIn: '1h' });

  // 返回令牌给客户端
  res.setHeader('Authorization', 'Bearer: ' + token);
  res.status(200).send({ token: token });
});

router.get('/refresh', passport.authenticate('jwt', { session: false }), (req, res) => {
  // 生成新的令牌
  const token = sign({ userId: req.user.id, username: req.user.username }, { expiresIn: '1h' });

  // 返回令牌给客户端
  res.setHeader('Authorization', 'Bearer: ' + token);
  res.status(200).send({ token: token });
});

router.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
  // 我们不需要在服务器端存储令牌，因此不需要执行任何操作
  // 返回成功消息给客户端
  res.status(200).send({ msg: 'logout success' });
});

router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).send({
    userId: req.user.id,
    username: req.user.username,
  });
});

module.exports = router;


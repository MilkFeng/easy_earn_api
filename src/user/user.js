const express = require('express');
const { passport, db } = require('./passport.js');

const { find_wallet } = require('../common/rhoopt.js');
const { requestChecker } = require('../common/utils.js');

const router = express.Router();

db.run(`CREATE TABLE IF NOT EXISTS wallet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  address TEXT NOT NULL
)`);

router.get('/get-wallets', passport.authenticate('jwt', { session: false }), (req, res) => {
  const userId = req.user.id;

  // 使用 userId 查询数据库，获取关联的所有地址
  db.all('SELECT address FROM wallet WHERE userId = ?', userId, (err, rows) => {
    if (err) {
      return res.status(500).send({ msg: 'Internal Server Error' });
    }

    // 从查询结果中提取地址
    const addresses = rows.map(row => row.address);

    // 返回地址列表给客户端
    return res.status(200).send({ addresses: addresses });
  });
});

// 添加钱包地址
router.post('/add-wallet', passport.authenticate('jwt', { session: false }), requestChecker('body', ['address'], async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  const ret = await find_wallet(address);

  if (ret) {
    if (ret[0]) {
      // 检查地址是否已存在
      db.get('SELECT id FROM wallet WHERE userId = ? AND address = ?', [userId, address], (err, row) => {
        if (err) {
          return res.status(500).send({ msg: 'Internal Server Error' });
        }

        if (row) {
          // 地址已存在
          return res.status(400).send({ msg: 'Address already exists' });
        }

        // 插入新的钱包地址
        db.run('INSERT INTO wallet (userId, address) VALUES (?, ?)', [userId, address], (err) => {
          if (err) {
            return res.status(500).send({ msg: 'Internal Server Error' });
          }

          return res.status(200).send({ msg: 'Address added successfully' });
        });
      });
    }
    else res.status(409).send({ msg: ret[1] });
  } else return res.status(409).send({ msg: "unable to communicate with rnode" });
}));


// 删除钱包地址
router.delete('/delete-wallet', passport.authenticate('jwt', { session: false }), requestChecker('body', ["address"], (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  // 删除数据库中的钱包地址
  db.run('DELETE FROM wallet WHERE userId = ? AND address = ?', [userId, address], (err) => {
    if (err) {
      return res.status(500).send({ msg: 'Internal Server Error' });
    }

    return res.status(200).send({ msg: 'Address deleted successfully' });
  });
}));

module.exports = router;


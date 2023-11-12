const express = require('express');
const { requestChecker, sendRhoResult, databaseOpt } = require('./common/utils.js');
const { passport } = require('./common/passport.js');
const { db } = require('./common/database.js');
const RhoOpts = require('./common/rhoopt.js');

const crypto = require('crypto');
const router = express.Router();

// 创建表
db.run(`CREATE TABLE IF NOT EXISTS task (
  address TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (address, nonce)
)`);
db.run(`CREATE TABLE IF NOT EXISTS record (
  address TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (address, nonce)
)`);
db.run(`CREATE TABLE IF NOT EXISTS task_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_address TEXT NOT NULL,
  task_nonce INTEGER NOT NULL,
  record_address TEXT NOT NULL,
  record_nonce INTEGER NOT NULL
)`);

// 从区块链获取指定任务（哈希）
router.get('/task-hash', passport.authenticate('jwt', { session: false }), requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const ret = await RhoOpts.get_task(address, nonce);
  sendRhoResult(ret, "hash", res);
}));

// 从区块链获取指定提交记录（哈希）
router.get('/record-hash', passport.authenticate('jwt', { session: false }), requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const ret = await RhoOpts.get_record(address, nonce);
  sendRhoResult(ret, "hash", res);
}));

// 获取钱包的任务序号
router.get('/task-nonce/:address', passport.authenticate('jwt', { session: false }), requestChecker('params', ['address'], async (req, res) => {
  const { address } = req.params;
  const ret = await RhoOpts.get_task_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));

// 获取钱包的提交序号
router.get('/record-nonce/:address', passport.authenticate('jwt', { session: false }), requestChecker('params', ['address'], async (req, res) => {
  const { address } = req.params;
  const ret = await RhoOpts.get_record_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));

// 获取钱包的更新序号
router.get('/update-nonce/:address', passport.authenticate('jwt', { session: false }), requestChecker('params', ['address'], async (req, res) => {
  const { address } = req.params;
  const ret = await RhoOpts.get_update_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));


// 从数据库获取指定任务（内容、酬金、状态）
router.get('/get-task', passport.authenticate('jwt', { session: false }), requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const query = 'SELECT * FROM task WHERE address = ? AND nonce = ?';
  databaseOpt('get', query, [address, nonce], res, row => {
    if (!row) return res.status(500).json({ msg: 'task not found' });
    res.status(200).json({ msg: "get task successfully", task: row });
  });
}));

// 从数据库获取全部任务（内容、酬金、状态）
router.get('/get-tasks', passport.authenticate('jwt', { session: false }), requestChecker('query',  [], (req, res) => {
  const query = 'SELECT * FROM task';
  databaseOpt('all', query, [], res, rows => {
    if (!rows) return res.status(500).json({ msg: 'tasks not found' });
    const tasks = rows.map(row => ({
      address: row.address,
      nonce: row.nonce,
      content: row.content
    }));
    res.status(200).json({ msg: "get tasks successfully", tasks });
  });
}));

// 从数据库获取指定钱包所有上传的任务
router.get('/get-all-tasks', passport.authenticate('jwt', { session: false }), requestChecker('query', ["address"], (req, res) => {
  const { address } = req.query;

  const query = 'SELECT * FROM task WHERE address = ?';
  databaseOpt('all', query, [address], res, rows => {
    if (!rows) return res.status(500).json({ msg: 'result is null' });
    const tasks = rows.map(row => ({
      address: row.address,
      nonce: row.nonce,
      content: row.content
    }));
    res.status(200).json({ msg: "get tasks successfully", tasks });
  });
}));

// 从数据库获取指定提交记录
router.get('/get-record', passport.authenticate('jwt', { session: false }), requestChecker('query', ["address", "nonce"], (req, res) => {
  const { address, nonce } = req.query;

  // 构造SQL查询语句
  const query = 'SELECT * FROM record WHERE address = ? AND nonce = ?';
  databaseOpt('get', query, [address, nonce], res, row => {
    if (!row) return res.status(500).json({ msg: 'task not found' });
    res.status(200).json({ msg: "get record successfully", record: row });
  });
}));

// 从数据库获取指定任务的所有提交记录
router.get('/get-all-records-of', passport.authenticate('jwt', { session: false }), requestChecker('query', ["address", "nonce"], (req, res) => {
  const { address, nonce } = req.query;
  const query = `
      SELECT record.*
      FROM task_record
      INNER JOIN record
      ON task_record.record_address = record.address
      AND task_record.record_nonce = record.nonce
      WHERE task_record.task_address = ? AND task_record.task_nonce = ?;
    `;
  databaseOpt('all', query, [address, nonce], res, results => {
    if (results.length === 0) return res.status(500).json({ msg: 'result is empty' });
    const records = results.map(record => ({
      address: record.address,
      nonce: record.nonce,
      content: record.content
    }));
    res.status(200).json({ msg: "get record successfully", records });
  });
}));

// 上传任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
// content 是任务内容，hash 是任务内容的哈希
// 这里的 version 是指软件版本，它决定了如何将 content 变成 hash

router.post('/upload', passport.authenticate('jwt', { session: false }), requestChecker('body', ["address", "nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { address, nonce, content, hash, pk, sig } = req.body;

  // 验证哈希值
  const Hash = crypto.createHash('sha256');
  Hash.update(content);
  const hashedContent = Hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content, expect hash: " + hashedContent });

  // 将 hash 存入区块链
  const ret = await RhoOpts.upload_task(address, nonce, hash, pk, sig);
  if (!ret) return res.status(409).send({ msg: "unable to communicate with rnode" });
  else if (!ret[0]) return res.status(409).send({ msg: ret[1] });

  // 上传任务，将 content 存入数据库
  const query = 'INSERT INTO task (address, nonce, content) VALUES (?, ?, ?)';
  databaseOpt('run', query, [address, nonce, content], res, _ => {
    res.status(200).json({ msg: "upload successfully" });
  });
}));

// 更新任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
router.post('/update', passport.authenticate('jwt', { session: false }), requestChecker('body', ["address", "task_nonce", "update_nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { address, task_nonce, update_nonce, content, hash, pk, sig } = mp;

  // 验证哈希值
  const Hash = crypto.createHash('sha256');
  Hash.update(content);
  const hashedContent = Hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content, expect hash: " + hashedContent });

  // 将 hash 存入区块链
  const ret = await RhoOpts.update_task(address, task_nonce, update_nonce, content, hash, pk, sig);
  if (!ret) return res.status(409).send({ msg: "unable to communicate with rnode" });
  else if (!ret[0]) return res.status(409).send({ msg: ret[1] });

  // 更新任务，将 content 存入数据库
  const query = 'UPDATE task SET content = ? where address = ? and nonce = ?';
  databaseOpt('run', query, [content, address, task_nonce], res, _ => {
    res.status(200).json({ msg: "update successfully" });
  });
}));

// 提交一个提交记录
router.post('/submit', passport.authenticate('jwt', { session: false }), requestChecker('body', ["task_address", "task_nonce", "record_address", "record_nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { task_address, task_nonce, record_address, record_nonce, content, hash, pk, sig } = req.body;

  // 验证哈希值
  const Hash = crypto.createHash('sha256');
  Hash.update(content);
  const hashedContent = Hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content, expect hash: " + hashedContent });

  // 将 hash 存入区块链
  const ret = await RhoOpts.upload_record(task_address, task_nonce, record_address, record_nonce, hash, pk, sig);
  if (!ret) return res.status(409).send({ msg: "unable to communicate with rnode" });
  else if (!ret[0]) return res.status(409).send({ msg: ret[1] });

  // 存入数据库
  const query = `
    BEGIN TRANSACTION;
    INSERT INTO record (address, nonce, content) VALUES (?, ?, ?);
    INSERT INTO task_record (task_address, task_nonce, record_address, record_nonce) VALUES (?, ?, ?, ?);
    COMMIT TRANSACTION;
  `;
  databaseOpt('run', query, [record_address, record_nonce, content, task_address, task_nonce, record_address, record_nonce], res, results => {
    return res.status(200).json({ msg: "upload successfully" });
  });

}));

module.exports = router;
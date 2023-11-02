const express = require('express');
const { requestChecker, sendRhoResult, databaseOpt } = require('../common/utils.js');
const { passport } = require('../user/passport.js');
const RhoOpts = require('../common/rhoopt.js');

const crypto = require('crypto');
const Hash = crypto.createHash('sha256');
const router = express.Router();

// 创建表

// 从区块链获取指定任务（哈希）
router.get('/task-hash', requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const ret = await RhoOpts.get_task(address, nonce);
  sendRhoResult(ret, "hash", res);
}));

// 从区块链获取指定提交记录（哈希）
router.get('/record-hash', requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const ret = await RhoOpts.get_record(address, nonce);
  sendRhoResult(ret, "hash", res);
}));

// 获取钱包的任务序号
router.get('/task-nonce', requestChecker('query', ['address'], async (req, res) => {
  const { address } = req.query;
  const ret = await RhoOpts.get_task_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));

// 获取钱包的提交序号
router.get('/record-nonce', requestChecker('query', ['address'], async (req, res) => {
  const { address } = req.query;
  const ret = await RhoOpts.get_record_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));

// 获取钱包的更新序号
router.get('/update-nonce', requestChecker('query', ['address'], async (req, res) => {
  const { address } = req.query;
  const ret = await RhoOpts.get_update_nonce(address);
  sendRhoResult(ret, "nonce", res);
}));


// 从数据库获取指定任务（内容、酬金、状态）
router.get('/get-task', passport.authenticate('jwt', { session: false }), requestChecker('query', ['address', 'nonce'], async (req, res) => {
  const { address, nonce } = req.query;
  const ret = await RhoOpts.get_task(address, nonce);
  sendRhoResult(ret, "task", res);
}));

// 从数据库获取指定钱包所有上传的任务
router.get('/get-all-tasks', passport.authenticate('jwt', { session: false }), requestChecker('query', ["address"], (req, res) => {
  const { address } = req.query;

  const query = 'SELECT * FROM task WHERE address = ?';
  databaseOpt(query, [address], res, results => {
    if (results.length === 0) return res.status(500).json({ msg: 'result is empty' });
    const tasks = results.map(result => result.content);
    res.status(200).json({ msg: "get tasks successfully", tasks });
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
  databaseOpt(query, [address, nonce], res, results => {
    if (results.length === 0) return res.status(500).json({ msg: 'result is empty' });
    const records = results.map(record => ({
      address: record.address,
      nonce: record.nonce,
      content: record.content
    }));
    res.status(200).json({ msg: "get record successfully", records });
  });
}));

// 从数据库获取指定提交记录
router.get('/get-record', passport.authenticate('jwt', { session: false }), requestChecker('query', ["address", "nonce"], (req, res) => {
  const { address, nonce } = req.query;

  // 构造SQL查询语句
  const query = 'SELECT content FROM record WHERE address = ? AND nonce = ?';

  databaseOpt(query, [address, nonce], res, results => {
    if (results.length === 0) return res.status(500).json({ msg: 'result is empty' });
    const content = results[0].content;
    res.status(200).json({ msg: "get task successfully", content });
  });
}));

// 上传任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
// content 是任务内容，hash 是任务内容的哈希
// 这里的 version 是指软件版本，它决定了如何将 content 变成 hash

router.post('/upload', passport.authenticate('jwt', { session: false }), requestChecker('body', ["address", "nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { address, nonce, content, hash, pk, sig } = req.body;

  // 验证哈希值
  Hash.update(content);
  const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content" });

  // 将 hash 存入区块链
  const ret = await RhoOpts.upload_task(address, nonce, content, hash, pk, sig);
  if (!ret) return res.status(409).send({ msg: "unable to communicate with rnode" });
  else if (!ret[0]) return res.status(409).send({ msg: ret[1] });

  // 上传任务，将 content 存入数据库
  const query = 'INSERT INTO task (address, nonce, content) VALUES (?, ?, ?)';
  databaseOpt(query, [address, nonce, content], _ => {
    res.status(200).json({ msg: "upload successfully" });
  });
}));

// 更新任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
router.post('/update', passport.authenticate('jwt', { session: false }), requestChecker('body', ["address", "task_nonce", "update_nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { address, task_nonce, update_nonce, content, hash, pk, sig } = mp;

  // 验证哈希值
  Hash.update(content);
  const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content" });

  // 将 hash 存入区块链
  const ret = await RhoOpts.update_task(address, task_nonce, update_nonce, content, hash, pk, sig);
  if (!ret) return res.status(409).send({ msg: "unable to communicate with rnode" });
  else if (!ret[0]) return res.status(409).send({ msg: ret[1] });

  // 更新任务，将 content 存入数据库
  const query = 'UPDATE task SET content = ? where address = ? and nonce = ?';
  databaseOpt(query, [content, address, task_nonce], _ => {
    res.status(200).json({ msg: "update successfully" });
  });
}));

// 提交一个提交记录
router.post('/submit', passport.authenticate('jwt', { session: false }), requestChecker('body', ["task_address", "task_nonce", "record_address", "record_nonce", "content", "hash", "pk", "sig"], async (req, res) => {
  const { task_address, task_nonce, record_address, record_nonce, content, hash, pk, sig } = req.body;

  // 验证哈希值
  Hash.update(content);
  const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
  if (hashedContent != hash) return res.status(400).json({ msg: "hash do not match with content" });

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
  databaseOpt(query, [record_address, record_nonce, content, task_address, task_nonce, record_address, record_nonce], res, results => {
    return res.status(200).json({ msg: "upload successfully" });
  });

}));

module.exports = router;
const express = require('express');
const { verify_body } = require('../common/utils.js');
const { passport, db } = require('../user/passport.js');
const { get_task, get_record, get_task_nonce, get_record_nonce, get_update_nonce } = require('../common/rhoopt.js');
const crypto = require('crypto');
const Hash = crypto.createHash('sha256');
const router = express.Router();

// 从区块链获取指定任务（哈希）
router.get('/task-hash', async (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 从区块链获取指定钱包的任务
    const ret = await get_task(address, nonce); 

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get task hash successfully", hash: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 从区块链获取指定提交记录（哈希）
router.get('/record-hash', async (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 从区块链获取指定提交记录
    const ret = await get_record(address, nonce);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get task hash successfully", hash: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 获取钱包的任务序号
router.get('/task-nonce', async (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if(mp == null) return ;
    const { address } = mp;

    // 获取钱包的任务序号
    const ret = await get_task_nonce(address);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get task nonce successfully", nonce: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 获取钱包的提交序号
router.get('/record-nonce', async (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if(mp == null) return ;
    const { address } = mp;

    // 获取钱包的提交序号
    const ret = await get_record_nonce(address);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get submit nonce successfully", nonce: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 获取钱包的更新序号
router.get('/update-nonce', async (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if(mp == null) return ;
    const { address } = mp;

    // 获取钱包的更新序号
    const ret = await get_update_nonce(address);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get update nonce successfully", nonce: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});


// 从数据库获取指定任务（内容、酬金、状态）
router.get('/get-task', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 构造SQL查询语句
    const query = 'SELECT content FROM task WHERE address = ? AND nonce = ?';

    // 使用数据库连接对象从 db 中获取连接
    const connection = db.getConnection();

    // 执行查询
    connection.query(query, [address, nonce], (error, ret) => {
        if (error) {
          console.error(error);
          res.status(500).json({ msg: 'error' });
        } else {
          if (ret.length === 0) {
            res.status(404).json({ msg: 'task not found' });
          } else {
            const content = ret[0].content;
            res.status(200).json({ msg:"get task successfully" , content });
          }
        }
    });


});

// 从数据库获取指定钱包所有上传的任务
router.get('/get-all-tasks', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if (mp == null) return;
    const { address } = mp;

    // 构造SQL查询语句
    const query = 'SELECT * FROM task WHERE address = ?';

    // 使用数据库连接对象从 db 中获取连接
    const connection = db.getConnection();

    // 执行查询
    connection.query(query, [address], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ msg: 'error' });
      } else {
        if (results.length === 0) {
          res.status(404).json({ msg: 'no uploaded tasks' });
        } else {
            const tasks = results.map(result => result.content);
            res.status(200).json({msg: "get tasks successfully", tasks });
        }
      }
    });
});

// 从数据库获取指定任务的所有提交记录
router.get('/get-all-records-of', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 构造SQL查询语句
    const query = `
      SELECT record.*
      FROM task_record
      INNER JOIN record
      ON task_record.record_address = record.address
      AND task_record.record_nonce = record.nonce
      WHERE task_record.task_address = ? AND task_record.task_nonce = ?;
    `;

    // 使用数据库连接对象从 db 中获取连接
    const connection = db.getConnection();

    // 执行查询
    connection.query(query, [address, nonce], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ msg: 'error' });
      } else {
        if (results.length === 0) {
          res.status(404).json({ msg: 'no uploaded task' });
        } else {
            const records = results.map(record => ({
                address: record.address,
                nonce: record.nonce,
                content: record.content
              }));
              res.status(200).json({ msg: "get record successfully", records });
        }
      }
    });
    

});

// 从数据库获取指定提交记录
router.get('/get-record', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 构造SQL查询语句
    const query = 'SELECT content FROM record WHERE address = ? AND nonce = ?';

    // 使用数据库连接对象从 db 中获取连接
    const connection = db.getConnection();

    // 执行查询
    connection.query(query, [address, nonce], (error, ret) => {
        if (error) {
          console.error(error);
          res.status(500).json({ msg: 'error' });
        } else {
          if (ret.length === 0) {
            res.status(404).json({ msg: 'task not found' });
          } else {
            const content = ret[0].content;
            res.status(200).json({ msg:"get task successfully" , content });
          }
        }
    });
});

// 上传任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
// content 是任务内容，hash 是任务内容的哈希
// 这里的 version 是指软件版本，它决定了如何将 content 变成 hash

router.post('/upload', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const mp = verify_body(req.body, ["address", "nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { address, nonce, content, hash, pk, sig } = mp;

    // 验证哈希值
    Hash.update(content);
    const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
    if (hashedContent != hash){
        res.status(400).json({msg:"hash do not match with content"});
    }else{
        // 将 hash 存入区块链
        const ret = await upload_task(address, nonce, content, hash, pk, sig);
        if(ret) {
            if(ret[0]) res.status(409).send({ msg: ret[1] });
        } else res.status(409).send({ msg: "unable to communicate with rnode" });
        // 上传任务，将 content 存入数据库
        const query = 'INSERT INTO task (address, nonce, content) VALUES (?, ?, ?)';
        const connection = db.getConnection();

        connection.query(query, [address, nonce, content], (error, results) => {
            connection.release(); // 释放数据库连接
            if (error) {
                console.error(error);
                res.status(500).json({ msg: "error" });
            } else {
                res.status(200).json({ msg: "upload successfully" });
            }
        });
    }
    

});

// 更新任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
router.post('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const mp = verify_body(req.body, ["address", "task_nonce", "update_nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { address, task_nonce, update_nonce, content, hash, pk, sig } = mp;

    // 验证哈希值
    Hash.update(content);
    const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
    if (hashedContent != hash){
        res.status(400).json({msg:"hash do not match with content"});
    }else{
        // 将 hash 存入区块链
        const ret = await update_task(address, task_nonce, update_nonce, content, hash, pk, sig);
        if(ret) {
            if(ret[0]) res.status(409).send({ msg: ret[1] });
        } else res.status(409).send({ msg: "unable to communicate with rnode" });

        // 更新任务，将 content 存入数据库
        const query = 'UPDATE task SET content = ? where address = ? and nonce = ?';
        const connection = db.getConnection();
        connection.query(query, [content, address, task_nonce], (error, results) => {
            connection.release(); // 释放数据库连接
            if (error) {
                console.error(error);
                res.status(500).json({ msg: "error" });
            } else {
                res.status(200).json({ msg: "update successfully" });
            }
        });
        
    }
    

});

// 提交一个提交记录
router.post('/submit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const mp = verify_body(req.body, ["task_address", "task_nonce", "record_address", "record_nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { task_address, task_nonce, record_address, record_nonce, content, hash, pk, sig } = mp;

    // 验证哈希值
    Hash.update(content);
    const hashedContent = hash.digest('hex'); // 'hex' 表示返回十六进制的哈希值
    if (hashedContent != hash){
        res.status(400).json({msg:"hash do not match with content"});
    }else{
        // 将 hash 存入区块链
        const ret = await update_task(task_address, task_nonce, record_address, record_nonce, hash, pk, sig);
        if(ret) {
            if(ret[0]) res.status(409).send({ msg: ret[1] });
        } else res.status(409).send({ msg: "unable to communicate with rnode" });

        // 更新任务，将 content 存入数据库
        const query1 = 'INSERT INTO record (address, nonce, content) VALUES (?, ?, ?)';
        const connection = db.getConnection();
        connection.query(query1, [address, nonce, content], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ msg: "error" });
            } else {
                res.status(200).json({ msg: "upload successfully" });
            }
        });

        const query2 = 'INSERT INTO task_record (task_address, task_nonce, record_address, record_nonce) VALUES (?, ?, ?, ?)';
        connection.query(query2, [task_address, task_nonce, record_address, record_nonce], (error, results) => {
            connection.release(); // 释放数据库连接
            if (error) {
                console.error(error);
                res.status(500).json({ msg: "error" });
            } else {
                res.status(200).json({ msg: "upload successfully" });
            }
        });

    }
});

module.exports = router;
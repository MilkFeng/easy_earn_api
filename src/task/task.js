const express = require('express');
const { verify_body } = require('../common/utils.js');
const { passport, db } = require('../user/passport.js');

const router = express.Router();

// 从区块链获取指定任务（哈希）
router.get('/task-hash', async (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 从区块链获取指定钱包的任务

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
    // const ret = await get_nonce(address);

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

});

// 从数据库获取指定钱包所有上传的任务
router.get('/get-all-tasks', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if (mp == null) return;
    const { address } = mp;

    // 从数据库获取指定钱包所有上传的任务

});

// 从数据库获取指定任务的所有提交记录
router.get('/get-all-records-of', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

});

// 从数据库获取指定提交记录
router.get('/get-record', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

});

// 上传任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
// content 是任务内容，hash 是任务内容的哈希
// 这里的 version 是指软件版本，它决定了如何将 content 变成 hash

router.post('/upload', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.body, ["address", "nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { address, nonce, content, hash, pk, sig } = mp;

    // 验证哈希值

    // 将 version 和 hash 存入区块链

    // 上传任务，将 version 和 content 存入数据库

});

// 更新任务，任务内容和状态存入数据库，任务内容的哈希存入区块链
router.post('/update', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.body, ["address", "task_nonce", "update_nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { address, task_nonce, update_nonce, content, hash, pk, sig } = mp;

    // 验证哈希值

    // 将 version 和 hash 存入区块链

    // 更新任务，将 version 和 content 存入数据库

});

// 提交一个提交记录
router.post('/submit', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.body, ["task_address", "task_nonce", "record_address", "record_nonce", "content", "hash", "pk", "sig"], res);
    if (mp == null) return;
    const { task_address, task_nonce, record_address, record_nonce, content, hash, pk, sig } = mp;

    // 验证哈希值

    // 将 version 和 hash 存入区块链

    // 提交任务，将 version 和 content 存入数据库
});

module.exports = router;
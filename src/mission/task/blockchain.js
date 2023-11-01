const express = require('express');
const { verify_body } = require('../../common/utils.js');

const router = express.Router();

// 从区块链获取指定钱包所有上传的任务（版本、所有内容的哈希）
router.get('/get', async (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

    // 从区块链获取指定钱包所有上传的任务

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
router.get('/submit-nonce', async (req, res) => {
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


// 上传任务，任务内容和状态存入数据库，任务内容的哈希和状态存入区块链
// 这里的 version 是指软件版本，它决定了如何对任务进行哈希
router.post('/upload', async (req, res) => {
    const mp = verify_body(req.body, ["address", "nonce", "version", "hash", "pk", "sig"], res);
    if(mp == null) return ;
    const { address, nonce, version, hash, pk, sig } = mp;

    // 上传任务

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "upload task successfully" });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });

});

// 更新任务
router.post('/update', async (req, res) => {
    const mp = verify_body(req.body, ["address", "task_nonce", "update_nonce", "version", "hash", "pk", "sig"], res);
    if(mp == null) return ;
    const { address, task_nonce, update_nonce, version, hash, pk, sig } = mp;

    // 更新任务

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "update task successfully" });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });

});


module.exports = router;
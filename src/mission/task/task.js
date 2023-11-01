const express = require('express');
const { verify_body } = require('../../common/utils.js');
const { passport, db } = require('../../user/passport.js');

const router = express.Router();

const blockchain_router = require('./blockchain.js');

router.use("/bc", blockchain_router);


// 从数据库获取指定任务（内容、酬金、状态）
router.delete('/get', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address", "nonce"], res);
    if(mp == null) return ;
    const { address, nonce } = mp;

});

// 从数据库获取指定钱包所有上传的任务
router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.query, ["address"], res);
    if (mp == null) return;
    const { address } = mp;

    // 从数据库获取指定钱包所有上传的任务

});

// 上传任务，任务内容和状态存入数据库，任务内容的哈希和状态存入区块链
// 这里的 version 是指软件版本，它决定了如何对任务进行哈希
router.post('/upsert', passport.authenticate('jwt', { session: false }), (req, res) => {
    const mp = verify_body(req.body, ["address", "nonce", "content"], res);
    if (mp == null) return;
    const { address, content } = mp;

    // 上传任务

});

module.exports = router;
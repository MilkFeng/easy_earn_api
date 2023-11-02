const express = require('express');
const { requestChecker, sendRhoResult } = require('../common/utils')

const {
    create_wallet,
    find_wallet,
    get_balance,
    get_nonce,
    transfer,
} = require('./../common/rhoopt.js');

// 创建一个路由
const router = express.Router();

// 创建钱包
router.post('/create', requestChecker('body', ["pk"], async (req, res) => {
    // 创建一个新的钱包，这里需要客户端发送钱包地址
    const { pk } = req.body;
    const ret = await create_wallet(pk);
    sendRhoResult(ret, "address", res);
}));

// 查找钱包
router.post('/find', requestChecker('body', ["address"], async (req, res) => {
    // 查找钱包，这里需要客户端发送钱包地址
    const { address } = req.body;
    const ret = await find_wallet(address);
    sendRhoResult(ret, "address", res);
}));

// 检测钱包中的代币余额
router.post('/balance', requestChecker('body', ["addresses"], async (req, res) => {
    const { addresses } = req.body;
    const ret = await get_balance(addresses);
    sendRhoResult(ret, "balance", res);
}));

// 获取钱包的交易序号
router.post('/nonce', requestChecker('body', ["address"], async (req, res) => {
    const { address } = req.body;
    const ret = await get_nonce(address);
    sendRhoResult(ret, "nonce", res);
}));

// 交易
router.post('/transfer', requestChecker('body', ["from", "to", "nonce", "amount", "pk", "sig"], async (req, res) => {
    const { from, to, nonce, amount, pk, sig } = req.body;
    const ret = await transfer(from, to, nonce, amount, pk, sig);
    sendRhoResult(ret, "ret", res);
}));

// 导出路由
module.exports = router;
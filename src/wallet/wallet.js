const express = require('express');
const rchainToolkit = require('@fabcotech/rchain-toolkit');

const {
    create_wallet,
    find_wallet,
    get_balance,
    verify_address,
    get_nonce,
    transfer,
} = require('./../common/rhoopt.js');

// 创建一个路由
const router = express.Router();

// 从请求体中获取指定的键值对
const verify_body = (body, keys, res) => {
    let map = {};
    for(var key of keys) {
        if(!key in body) {
            res.status(400).send({ msg: "invalid request body" });
            return null;
        }
        console.log("get " + key + ": " + body[key]);
        let validate = (_) => true;
        switch(key) {
            case 'pk':
                // 验证公钥是否合法
                validate = (pk) => {
                    try {
                        rchainToolkit.utils.revAddressFromPublicKey(pk);
                        return true;
                    } catch(err) {
                        return false;
                    }
                };
                break;
            
            case 'address':
            case 'from':
            case 'to':
                // 验证钱包地址是否合法
                validate = verify_address;
                break;
            case 'amount':
                // 交易金额必须是正整数
                validate = (amount) => Number.isInteger(amount) && amount > 0;
                break;
            
            case 'addresses':
                // 验证钱包地址列表是否合法
                validate = (addresses) => {
                    addresses.forEach(address => {
                        if(!verify_address(address)) return false;
                    });
                    return true;
                };
                break;
            
            case 'nonce':
                // 验证交易序号是否合法
                validate = (nonce) => Number.isInteger(nonce) && nonce >= 0;
                break;
            
            default:
                break;
        };
        if(!validate(body[key])) {
            res.status(400).send({ msg: "invalid " + key });
            return null;
        }
        map[key] = body[key];
    }
    return map;
};

// 创建钱包
router.post('/create', async (req, res) => {
    // 创建一个新的钱包，这里需要客户端发送钱包地址
    const mp = verify_body(req.body, ["pk"], res);
    if(mp == null) return ;
    const { pk } = mp;

    const ret = await create_wallet(pk);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "wallet create successfully", address: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else return res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 查找钱包
router.post('/find', async (req, res) => {
    // 查找钱包，这里需要客户端发送钱包地址
    const mp = verify_body(req.body, ["address"], res);
    if(mp == null) return ;
    const { address } = mp;

    const ret = await find_wallet(address);

    try {
        return res.status(200).send({ res: ret[0], address: ret[1] });
    } catch(err) {
        return res.status(409).send({ msg: "unable to communicate with rnode" });
    }
});

// 检测钱包中的代币余额
router.post('/balance', async (req, res) => {
    const mp = verify_body(req.body, ["addresses"], res);
    if(mp == null) return ;
    const { addresses } = mp;

    const ret = await get_balance(addresses);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get balance successfully", balance: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 获取钱包的交易序号
router.get('/nonce', async (req, res) => {
    const mp = verify_body(req.body, ["address"], res);
    if(mp == null) return ;
    const { address } = mp;

    const ret = await get_nonce(address);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get nonce successfully", nonce: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 交易
router.post('/transfer', async (req, res) => {
    const mp = verify_body(req.body, ["from", "to", "nonce", "amount", "pk", "sig"], res);
    if(mp == null) return ;
    const { from, to, nonce, amount, pk, sig } = mp;

    const ret = await transfer(from, to, nonce, amount, pk, sig);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "transfer successfully", ret: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 导出路由
module.exports = router;
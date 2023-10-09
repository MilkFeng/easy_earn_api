const express = require('express');
const { create_wallet, find_wallet, get_balance, verify_address } = require('./../common/rhoopt.js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');

// 创建一个路由
const router = express.Router();

const verify_address_from_body = (body, res) => {
    let address;
    try {
        address = body.address;
    } catch (error) {
        res.status(400).send({ msg: "invalid request body" });
        return null;
    }
    console.log(`get wallet address: ${address}`);

    // 检测地址是否合法
    if(!verify_address(address)) {
        res.status(400).send({ msg: "invalid address" });
        return null;
    }
    return address;
};

const verify_pk_from_body = (body, res) => {
    let pk;
    try {
        pk = body.pk;
    } catch (error) {
        res.status(400).send({ msg: "invalid request body" });
        return null;
    }
    console.log(`get pk: ${pk}`);

    try {
        rchainToolkit.utils.revAddressFromPublicKey(pk);
    } catch(err) {
        res.status(400).send({ msg: "invalid public key" });
        return null;
    }

    return pk;
}

// 创建钱包
router.post('/create', async (req, res) => {
    // 创建一个新的钱包，这里需要客户端发送钱包地址
    const pk = verify_pk_from_body(req.body, res);
    if(pk == null) return ;

    const ret = await create_wallet(pk);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "wallet create successfully", address: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else return res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 查找钱包
router.post('/find', async (req, res) => {
    // 查找钱包，这里需要客户端发送钱包地址
    const address = verify_address_from_body(req.body, res);
    if(address == null) return ;

    const ret = await find_wallet(rho_code, 0);

    try {
        return res.status(200).send({ res: ret[0], address: ret[1] });
    } catch(err) {
        return res.status(409).send({ msg: "unable to communicate with rnode" });
    }
});

// 检测钱包中的代币余额
router.post('/balance', async (req, res) => {
    const address = verify_address(req.body, res);
    if(address == null) return ;

    const ret = await get_balance(rho_code, 0);

    if(ret) {
        if(ret[0]) res.status(200).send({ msg: "get balance successfully", balance: ret[1] });
        else res.status(409).send({ msg: ret[1] });
    } else res.status(409).send({ msg: "unable to communicate with rnode" });
});

// 导出路由
module.exports = router;
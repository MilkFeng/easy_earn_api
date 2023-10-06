const express = require('express');
const { verifyRevAddr } = require('@tgrospic/rnode-grpc-js')
const { func_deploy, func_deploy_fromfile, func_deploy_fromfile_with_template } = require('./../common/deploy.js');

// 创建一个路由
const router = express.Router();

// EasyToken 的地址
const token_id = "rho:id:i1be8sj7z4a5e6bg7cn6rt11guss6kxx3hoc13afghgeroqj6n5max";

const verify_address = (body, res) => {
    let address;
    try {
        address = body.address;
    } catch (error) {
        res.status(400).send({ msg: "invalid request body" });
        return null;
    }
    console.log(`get wallet address: ${address}`);

    // 检测地址是否合法
    if(!verifyRevAddr(address)) {
        res.status(400).send({ msg: "invalid address" });
        return null;
    }
    return address;
};

// 创建钱包
router.post('/create', async (req, res) => {
    // 创建一个新的钱包，这里需要客户端发送钱包地址
    const address = verify_address(req.body, res);
    if(address == null) return ;

    // 区块链操作
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("create", "${address}", *result)
        }
    }`;

    const ret = await func_deploy(rho_code, 0);

    if(ret[0]) res.status(200).send({ msg: ret[1] });
    else res.status(409).send({ msg: ret[1] });
});

// 检测钱包中的代币余额
router.post('/balance', async (req, res) => {
    const address = verify_address(req.body, res);
    if(address == null) return ;

    // 区块链操作
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("balanceOf", "${address}", *result)
        }
    }`;

    const ret = await func_deploy(rho_code, 0);

    if(ret[0]) res.status(200).send({ msg: "get balance successfully", balance: ret[1] });
    else res.status(409).send({ msg: ret[1] });
});

// 导出路由
module.exports = router;
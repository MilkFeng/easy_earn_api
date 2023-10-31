const { verify_address } = require('../common/rhoopt.js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');

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
            res.status(400).send({ msg: "invalid " + key + ": " + body[key] });
            return null;
        }
        map[key] = body[key];
    }
    return map;
};


module.exports = {
    verify_body,
};
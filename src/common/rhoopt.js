const { func_deploy, func_deploy_fromfile } = require('./deploy.js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');
const { verifyRevAddr } = require('@tgrospic/rnode-grpc-js')

// EasyToken 的地址
const token_id = "rho:id:d4p7xuksu3h4pdkrjg77g9sixmo4s8gxsbdta6ep3yzwhz9i6taezo";

const create_wallet = async(pk) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("create", "${pk}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
};

const find_wallet = async(address) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("find", "${address}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
};

const get_balance = async(addresses) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh, stdout(\`rho:io:stdout\`) in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            new iterator, retCh, listCh in {
                for(@addresses <= iterator) {
                    match addresses {
                        [hd, ...tl] => {
                            vault!("balanceOf", hd, *retCh) |
                            for(@(suc, ret) <- retCh; @(_, list) <- listCh) {
                                if(not suc) {
                                    listCh!((false, ret)) |
                                    iterator!([])
                                } else {
                                    listCh!((true, list ++ [ret])) |
                                    iterator!(tl)
                                }
                            }
                        } _ => {
                            for(@ret <- listCh) {
                                result!(ret)
                            }
                        }
                    }
                } |
                iterator!([${addresses.map(x => `\"${x}\"`)}]) |
                listCh!((true, []))
            }
        }
    }`;
    return await func_deploy(rho_code, 0);
};

const get_nonce = async(address) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("getNonce", "${address}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
};

const transfer = async(nonce, from, to, amount, pk, sig) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("transfer", "${from}", "${to}", ${nonce}, ${amount}, "${pk}", "${sib}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
};

const verify_address = verifyRevAddr;

module.exports = {
    create_wallet,
    find_wallet,
    get_balance,
    get_nonce,
    transfer,
    verify_address,
};

const { func_deploy, func_deploy_fromfile } = require('./deploy.js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');

// EasyToken 的地址
const token_id = "rho:id:gzuh33orq3eouo9p4fzytcinwkr1tgc3wbdofo9dyr9yysu4nfnhwh";

const create_wallet = async(pk) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("create", "${pk}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
}

const find_wallet = async(address) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("find", "${address}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
}

const get_balance = async(address) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("balanceOf", "${address}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
}

const get_nonce = async(address) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("getNonce", "${address}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
}

const transfer = async(nonce, from, to, amount, pk, sig) => {
    const rho_code = `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${token_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("transfer", "${from}", "${to}", ${nonce}, ${amount}, "${pk}", "${sib}", *result)
        }
    }`;
    return await func_deploy(rho_code, 0);
}

module.exports = {
    create_wallet,
    find_wallet,
    get_balance,
    get_nonce,
    transfer
};

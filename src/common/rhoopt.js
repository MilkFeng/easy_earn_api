const { func_deploy, func_deploy_fromfile } = require('./deploy.js');
const { verifyRevAddr } = require('@tgrospic/rnode-grpc-js')

// 将 contract id 粘贴到这里
const contract_id = "rho:id:3w8zg13xnsbgbyx6cgfhyrw4nsriwyjycbiwo38xercxzfoesaop33";

const run_with_full_code = async (code) => await func_deploy(code, 0);

const run_with_name_and_args = async (name, args) => await run_with_full_code(
    `new result, rl(\`rho:registry:lookup\`), vaultCh in {
        rl!(\`${contract_id}\`, *vaultCh) |
        for(vault <- vaultCh) {
            vault!("${name}", ${args}, *result)
        }
    }`);

// 创建钱包
const create_wallet = async (pk) => await run_with_name_and_args("create", `"${pk}"`);

// 查找钱包
const find_wallet = async (address) => await run_with_name_and_args("find", `"${address}"`);

// 获取钱包余额
const get_balance = async (addresses) => await run_with_full_code(
    `new result, rl(\`rho:registry:lookup\`), vaultCh, stdout(\`rho:io:stdout\`) in {
        rl!(\`${contract_id}\`, *vaultCh) |
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
    }`);

// 获取交易序号
const get_nonce = async (address) => await run_with_name_and_args("nonceOf", `"${address}"`);

// 交易
const transfer = async (from, to, nonce, amount, pk, sig) => await run_with_name_and_args("transfer", `"${from}", "${to}", ${nonce}, ${amount}, "${pk}", "${sig}"`);

// 验证钱包地址的合法性
const verify_address = verifyRevAddr;


// 获取任务序号
const get_task_nonce = async (address) => await run_with_name_and_args("taskNonceOf", `"${address}"`);

// 获取提交序号
const get_record_nonce = async (address) => await run_with_name_and_args("recordNonceOf", `"${address}"`);

// 获取任务的哈希值
const get_task = async (address, nonce) => await run_with_name_and_args("taskOf", `"${address}", ${nonce}`);

// 获取提交记录的哈希值
const get_record = async (address, nonce) => await run_with_name_and_args("recordOf", `"${address}", ${nonce}`);

// 获取钱包的更新序号
const get_update_nonce = async (address) => await run_with_name_and_args("updateNonceOf", `"${address}"`);

// 提交任务
const upload_task = async (address, nonce, hash, pk, sig) => await run_with_name_and_args("uploadTask", `"${address}", ${nonce}, "${hash}", "${pk}", "${sig}"`);

//更新任务
const update_task = async (address, task_nonce, update_nonce, hash, pk, sig) => await run_with_name_and_args("updateTask", `"${address}", ${task_nonce}, ${update_nonce} ,"${hash}", "${pk}", "${sig}"`);

//提交记录
const upload_record = async (submitter, submit_nonce, publisher, publish_nonce, hash, pk, sig) => await run_with_name_and_args("uploadRecord",`"${submitter}", ${submit_nonce}, "${publisher}", ${publish_nonce} ,"${hash}", "${pk}", "${sig}"`);

module.exports = {
    create_wallet,
    find_wallet,
    get_balance,
    get_nonce,
    transfer,
    verify_address,

    get_task_nonce,
    get_record_nonce,
    get_task,
    get_record,
    get_update_nonce,
    upload_task,
    update_task,
    upload_record,
};

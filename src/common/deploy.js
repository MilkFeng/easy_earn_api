const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rchainToolkit = require('@fabcotech/rchain-toolkit');
const rchainToolkit_grpc = require('@fabcotech/rchain-toolkit/dist/grpc.js');
const fs = require('fs');

const PRIVATE_KEY = '6b2c9887ce24094087896a0fa3c64e3faec8ad06f16fbe72da3a44463aeca8a9';
const PUBLIC_KEY = rchainToolkit.utils.publicKeyFromPrivateKey(PRIVATE_KEY);
const READ_ONLY_HOST = 'http://localhost:40403';
const VALIDATOR_HOST = 'http://localhost:40403';
const SHARD_ID = 'root';
const WAITING_TIME = 1000;

const func_deploy = async (rho_code_, order_) => {

    const _timestamp = new Date().valueOf();

    const grpcClient = await rchainToolkit_grpc.getGrpcProposeClient(
        "localhost:40402",
        grpc,
        protoLoader
    );

    let pd;

    if (order_ >= 0) {
        pd = await rchainToolkit.http.prepareDeploy(
            READ_ONLY_HOST,
            {
                deployer: PUBLIC_KEY,
                timestamp: _timestamp,
                nameQty: order_ + 1
            }
        );

        console.log('prepare deploy: ' + pd);
    };

    const _validAfterBlockNumber = await rchainToolkit.http.validAfterBlockNumber(
        "http://localhost:40403"
    );

    const deployOptions = rchainToolkit.utils.getDeployOptions(
        {
            timestamp: _timestamp,
            term: rho_code_,
            shardId: SHARD_ID,
            privateKey: PRIVATE_KEY,
            phloPrice: 1,
            phloLimit: 100000000,
            validAfterBlockNumber: _validAfterBlockNumber || -1
        }
    );

    let deployResponse;
    try {
        deployResponse = await rchainToolkit.http.deploy(
            "http://localhost:40403",
            deployOptions
        );
    } catch (err) {
        console.log(err);
    };

    console.log('deploy response: ' + deployResponse);

    let proposeResponse;
    try {
        proposeResponse = await rchainToolkit_grpc.propose({}, grpcClient);
    } catch (err) {
        console.log(err);
    };

    // await new Promise(resolve => setTimeout(resolve, WAITING_TIME));

    console.log('propose success!');

    let ret;

    if (order_ >= 0) {
        const dataAtUnforgeableName = await rchainToolkit.http.dataAtName(
            READ_ONLY_HOST,
            {
                name: {
                    UnforgPrivate: { data: JSON.parse(pd).names[order_] }
                },
                depth: 3
            }
        );

        console.log('data-at-name response: ' + dataAtUnforgeableName);

        const data_json = JSON.parse(dataAtUnforgeableName).exprs[0];

        let data;

        if (data_json != null) {
            data = rchainToolkit.utils.rhoValToJs(
                data_json.expr
            );
        } else {
            data = null;
        }

        console.log('data: ' + data);

        ret = data;
        console.log('deploy finished!');

    } else {
        ret = null;
        console.log('simple deploy finished!');
    }

    return ret;
};

const func_deploy_fromfile = async (rho_file_, order_) => {
    const rho_code = fs.readFileSync(rho_file_, 'utf8');
    return func_deploy(rho_code, order_);
};

module.exports = {
    func_deploy,
    func_deploy_fromfile
};
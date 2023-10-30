const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rchainToolkit = require('@fabcotech/rchain-toolkit');
const rchainToolkit_grpc = require('@fabcotech/rchain-toolkit/dist/grpc.js');

const hexToByteArray = (hex) => {
    const byteArray = [];
    for (let i = 0; i < hex.length; i += 2) {
        byteArray.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(byteArray);
}

const toHexString = (byteArray) => {
    let s = ""
    byteArray.forEach(function (byte) {
        s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return s;
}

const privateKey = "6b2c9887ce24094087896a0fa3c64e3faec8ad06f16fbe72da3a44463aeca8a9"

const bytes = rchainToolkit.utils.toByteArray([0, 100, "1111iHrWnoTzGxyUsmTCWJ2nKCDsoHRiL7QsDCuBvY52rxyrHN7WS"])
const hash = rchainToolkit.utils.getBlake2Hash(bytes)
const sig = rchainToolkit.utils.signSecp256k1(hash, privateKey)

console.log(toHexString(sig))


// {
//     "nonce": 0,
//     "amount": 100,
//     "to": "1111iHrWnoTzGxyUsmTCWJ2nKCDsoHRiL7QsDCuBvY52rxyrHN7WS",
// }
const rchainToolkit = require('@fabcotech/rchain-toolkit');
const secp256k1 = require('secp256k1');
const elliptic = require('elliptic');

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

function uint8ArrayToHexString(uint8Array) {
    return Array.from(uint8Array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

const privateKey = "6b2c9887ce24094087896a0fa3c64e3faec8ad06f16fbe72da3a44463aeca8a9"

const bytes = rchainToolkit.utils.toByteArray(["11112gNSU4Ytt3b2TpAQnggARSidPpNxrNkWqFFg52aNe5t6sjCy2c", 6, "612ecb39e5f3fb448e30941270c9a6d7e237ce4214af363e97ebefafda35a724"])
const hash = rchainToolkit.utils.getBlake2Hash(bytes)

console.log(bytes);
console.log(hash)

const sig = rchainToolkit.utils.signSecp256k1(hash, privateKey)

console.log(sig)
console.log(toHexString(sig))

const sig2 = secp256k1.ecdsaSign(hash, hexToByteArray(privateKey))

const signSecp256k1 = (hash, privateKey) => {
    const ec = new elliptic.ec("secp256k1");
    const keyPair = ec.keyFromPrivate(privateKey);
    const signature = keyPair.sign(new Uint8Array(hash), {
        canonical: true,
    });
    const derSign = new Uint8Array(signature.toDER());
    if (!ec.verify(new Uint8Array(hash), signature, keyPair, "hex")) {
        throw new Error("Failed to verify signature");
    }
    return derSign;
};

console.log(signSecp256k1(hash, privateKey))

console.log(hexToByteArray(privateKey))
console.log(sig2.signature)
console.log(uint8ArrayToHexString(sig2.signature));

// {
//     "from": "11112gNSU4Ytt3b2TpAQnggARSidPpNxrNkWqFFg52aNe5t6sjCy2c",
//     "to": "1111iHrWnoTzGxyUsmTCWJ2nKCDsoHRiL7QsDCuBvY52rxyrHN7WS",
//     "nonce": 0,
//     "amount": 100,
// }


const crypto = require('crypto');
const Hash = crypto.createHash('sha256');

Hash.push('{version:1,text:\"test\"}');
console.log(Hash.digest('hex'));
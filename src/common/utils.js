const { verifyRevAddr } = require('@tgrospic/rnode-grpc-js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');
const { db } = require('./database.js');

const VerifyUtils = {

  // 验证公钥的合法性
  verify_public_key(pk) {
    try {
      rchainToolkit.utils.revAddressFromPublicKey(pk);
      return true;
    } catch (err) {
      return false;
    }
  },

  // 验证钱包地址的合法性
  verify_address(address) {
    return verifyRevAddr(address);
  },

  // 验证钱包地址列表的合法性
  verify_addresses(addresses) {
    if (typeof addresses.forEach !== 'function') return false;
    addresses.forEach(address => {
      if (!VerifyUtils.verify_address(address)) return false;
    });
    return true;
  },

  // 验证交易序号的合法性
  verify_nonce(nonce) {
    return Number.isInteger(nonce) && nonce >= 0;
  },

  // 验证交易金额的合法性
  verify_amount(amount) {
    return Number.isInteger(amount) && amount > 0;
  },
};

const ConvertUtils = {
  stringToNumber(str) {
    try {
      return parseInt(str);
    } catch (err) {
      return str;
    }
  }
};

const converter = {
  amount: ConvertUtils.stringToNumber,

  nonce: ConvertUtils.stringToNumber,
  task_nonce: ConvertUtils.stringToNumber,
  record_nonce: ConvertUtils.stringToNumber,
};

const validator = {
  pk: VerifyUtils.verify_public_key,

  task_address: VerifyUtils.verify_address,
  record_address: VerifyUtils.verify_address,
  address: VerifyUtils.verify_address,
  from: VerifyUtils.verify_address,
  to: VerifyUtils.verify_address,

  amount: VerifyUtils.verify_amount,

  addresses: VerifyUtils.verify_addresses,

  nonce: VerifyUtils.verify_nonce,
  task_nonce: VerifyUtils.verify_nonce,
  record_nonce: VerifyUtils.verify_nonce,
};

const requestChecker = (type, keys, callback) => async (req, res) => {
  try {
    const data = req[type];
    if (data === undefined) return res.status(400).send({ msg: "invalid request data" });
    for (var key of keys) {
      if (!(key in data)) return res.status(400).send({ msg: "invalid request data" });

      console.log("get " + key + ": " + data[key]);

      let convert = converter[key] || (x => x);
      const value = convert(data[key]);

      let validate = validator[key] || ((_) => true);

      if (data[key] === undefined || !validate(value)) {
        let err = "invalid " + key + ": " + value + "(" + typeof value + ")";
        console.error(err);
        return res.status(400).send({ msg: err });
      }
      req[type][key] = value;
    }
    return callback(req, res);
  } catch (err) {
    console.error("invalid request data, error: " + err);
    return res.status(400).send({ msg: "invalid request data" });
  }
};

const sendRhoResult = (ret, key, res) => {
  if (ret) {
    if (ret[0]) {
      response = { msg: "operation success" };
      response[key] = ret[1];
      res.status(200).send(response);
    }
    else res.status(409).send({ msg: ret[1] });
  } else res.status(409).send({ msg: "unable to communicate with rnode" });
};


const databaseOpt = (type, query, args, res, callback) => {
  const onErr = error => {
    console.error(error);
    return res.status(500).json({ msg: 'database error: ' + error });
  };
  if (type === 'get') {
    db.get(query, args, (error, row) => {
      if (error) onErr(error)
      else callback(row);
    });
  } else if (type === 'run') {
    db.run(query, args, (error) => {
      if (error) onErr(error)
      else callback();
    });
  } else {
    db.all(query, args, (error, rows) => {
      if (error) onErr(error)
      else callback(rows);
    });
  }
};

module.exports = {
  VerifyUtils,
  requestChecker,
  sendRhoResult,
  databaseOpt
};
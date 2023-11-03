const { verifyRevAddr } = require('@tgrospic/rnode-grpc-js');
const rchainToolkit = require('@fabcotech/rchain-toolkit');

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

const validator = {
  pk: VerifyUtils.verify_public_key,

  address: VerifyUtils.verify_address,
  from: VerifyUtils.verify_address,
  to: VerifyUtils.verify_address,

  amount: VerifyUtils.verify_amount,

  addresses: VerifyUtils.verify_addresses,

  nonce: VerifyUtils.verify_nonce,
};

const requestChecker = (type, keys, callback) => async (req, res) => {
  try {
    const data = req[type];
    if (data === undefined) return res.status(400).send({ msg: "invalid request data" });
    for (var key of keys) {
      if (!(key in data)) return res.status(400).send({ msg: "invalid request data" });

      console.log("get " + key + ": " + data[key]);

      let validate = validator[key] || ((_) => true);

      if (data[key] === undefined || !validate(data[key])) {
        console.error("invalid " + key + ": " + data[key]);
        return res.status(400).send({ msg: "invalid " + key + ": " + data[key] });
      }
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
      response = { msg: "operation success"};
      response[key] = ret[1];
      res.status(200).send(response);
    }
    else res.status(409).send({ msg: ret[1] });
  } else res.status(409).send({ msg: "unable to communicate with rnode" });
};


const databaseOpt = (query, args, res, callback) => {
  // 使用数据库连接对象从 db 中获取连接
  const connection = db.getConnection();

  // 执行查询
  connection.query(query, args, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ msg: 'database error' });
    } else callback(results);
  });
};

module.exports = {
  VerifyUtils,
  requestChecker,
  sendRhoResult,
  databaseOpt
};
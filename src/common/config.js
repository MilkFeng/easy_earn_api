const fs = require('fs');
const path = require('path');

let _config = {};
const config_path = path.join(__dirname, '../../config.json');
if (fs.existsSync(config_path)) _config = JSON.parse(fs.readFileSync(config_path, 'utf8'));

const config = {
  contract_id: _config.contract_id || 'rho:id:98x5p8qypec8u7pagiejkuecgzi9ehm5ewui7xwmzk11ttypequgpx',
};

if (!fs.existsSync(config_path)) {
  try {
    fs.writeFile(config_path, JSON.stringify(config, null, 2), _ => { });
    console.log('config.json was created');
  } catch (err) {
    console.error('cannot create config.json. error: ', err);
  }
}

const keys = Object.keys(config);
keys.forEach((key) => {
  console.log('load ' + key + ': ' + config[key]);
});

module.exports = {
  config,
}